'use client';

import { useEffect, useState, useRef } from 'react';
import { User, ChatRoom, Message } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { encryptFile, signFile, decryptFile, verifySignature } from '@/services/api';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  currentUser: User;
  room: ChatRoom | null;
  users: User[];
}

export default function ChatWindow({ currentUser, room, users }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  useEffect(() => {
    if (room) {
      loadMessages();
      
      // Menggunakan Supabase Realtime (WebSockets) agar tidak nyepam di Network Tab
      const channel = supabase
        .channel(`room_${room.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages_kriptografi',
            filter: `room_id=eq.${room.id}`
          },
          () => {
            // Jika ada perubahan di database, load ulang pesan
            loadMessages();
          }
        )
        .subscribe();

      // Cleanup on unmount or room change
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Clear messages when no room selected
      setMessages([]);
    }
  }, [room?.id]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Jika jarak ke bawah kurang dari 100px, anggap user sedang berada di paling bawah
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  useEffect(() => {
    // Hanya scroll otomatis ke bawah JIKA user sedang berada di posisi bawah
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom]);

  const loadMessages = async () => {
    if (!room) return;

    const { data } = await supabase
      .from('messages_kriptografi')
      .select('*')
      .eq('room_id', room.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRoomMembers = async () => {
    if (!room) return [];

    const { data } = await supabase
      .from('room_members_kriptografi')
      .select('user_id')
      .eq('room_id', room.id);

    return data?.map(m => m.user_id) || [];
  };

  const sendTextMessage = async () => {
    if (!messageText.trim() || !room) return;

    try {
      setSending(true);

      // Get room members
      const memberIds = await getRoomMembers();

      // Encrypt message using ROOM's public key (shared by all members)
      const textBlob = new Blob([messageText], { type: 'text/plain' });
      const textFile = new File([textBlob], 'message.txt');
      
      const publicKeyBlob = new Blob([room.public_key], { type: 'text/plain' });
      const publicKeyFile = new File([publicKeyBlob], 'public_key.txt');

      const encryptedBlob = await encryptFile(textFile, publicKeyFile);
      const encryptedText = await encryptedBlob.text();

      // Sign the message using ROOM's private key
      const privateKeyBlob = new Blob([room.private_key], { type: 'text/plain' });
      const privateKeyFile = new File([privateKeyBlob], 'private_key.txt');
      
      const signatureBlob = await signFile(textFile, privateKeyFile);
      const signature = await signatureBlob.text();

      // Save message
      const { data: newMessage, error } = await supabase
        .from('messages_kriptografi')
        .insert({
          room_id: room.id,
          sender_id: currentUser.id,
          message_type: 'text',
          encrypted_content: encryptedText,
          signature: signature,
        })
        .select()
        .single();

      if (error) throw error;

      // Add recipients
      const recipientRecords = memberIds
        .filter(id => id !== currentUser.id)
        .map(id => ({
          message_id: newMessage.id,
          recipient_id: id,
        }));

      if (recipientRecords.length > 0) {
        await supabase
          .from('message_recipients_kriptografi')
          .insert(recipientRecords);
      }

      setMessageText('');
      
      // Refresh messages after sending
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendFileMessage = async () => {
    if (!selectedFile || !room) return;

    try {
      setSending(true);

      // Get room members
      const memberIds = await getRoomMembers();

      // Encrypt file using ROOM's public key
      const publicKeyBlob = new Blob([room.public_key], { type: 'text/plain' });
      const publicKeyFile = new File([publicKeyBlob], 'public_key.txt');

      const encryptedBlob = await encryptFile(selectedFile, publicKeyFile);

      // Upload to Supabase Storage
      const fileName = `${room.id}/${Date.now()}-${selectedFile.name}.encrypted`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files-kriptografi')
        .upload(fileName, encryptedBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-files-kriptografi')
        .getPublicUrl(fileName);

      // Sign the original file using ROOM's private key
      const privateKeyBlob = new Blob([room.private_key], { type: 'text/plain' });
      const privateKeyFile = new File([privateKeyBlob], 'private_key.txt');
      
      const signatureBlob = await signFile(selectedFile, privateKeyFile);
      const signature = await signatureBlob.text();

      // Save message
      const { data: newMessage, error } = await supabase
        .from('messages_kriptografi')
        .insert({
          room_id: room.id,
          sender_id: currentUser.id,
          message_type: 'file',
          encrypted_content: urlData.publicUrl,
          signature: signature,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_url: urlData.publicUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Add recipients
      const recipientRecords = memberIds
        .filter(id => id !== currentUser.id)
        .map(id => ({
          message_id: newMessage.id,
          recipient_id: id,
        }));

      if (recipientRecords.length > 0) {
        await supabase
          .from('message_recipients_kriptografi')
          .insert(recipientRecords);
      }

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Refresh messages after sending
      await loadMessages();
    } catch (error) {
      console.error('Error sending file:', error);
      alert('Failed to send file');
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      sendFileMessage();
    } else {
      sendTextMessage();
    }
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <p className="text-zinc-400">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-900">
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUser={currentUser}
            users={users}
            room={room}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4">
        {selectedFile && (
          <div className="mb-2 p-2 bg-zinc-800 rounded text-sm text-zinc-300 flex items-center justify-between">
            <span className="truncate">{selectedFile.name}</span>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-zinc-500 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition disabled:opacity-50"
          >
            📎
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            disabled={sending || !!selectedFile}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={sending || (!messageText.trim() && !selectedFile)}
            className="px-6 py-2 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-medium rounded transition"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
