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
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a chat</h3>
          <p className="text-sm text-slate-500">Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
      {/* Messages Viewport */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">No messages yet</p>
              <p className="text-xs text-slate-500">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
        )}
      </div>

      {/* Input Console */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0">
        {selectedFile && (
          <div className="mb-2 p-2 bg-slate-100 border border-slate-200 rounded flex items-center justify-between">
            <span className="text-xs font-mono text-slate-700 truncate">{selectedFile.name}</span>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-slate-400 hover:text-rose-600 ml-2"
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
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-none transition-colors disabled:opacity-50 font-mono text-sm"
          >
            📎
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="TYPE COMMAND OR MESSAGE..."
            disabled={sending || !!selectedFile}
            className="flex-1 bg-white border border-slate-300 rounded-none px-4 py-2 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-shadow disabled:opacity-50 disabled:bg-slate-50"
          />

          <button
            onClick={handleSend}
            disabled={sending || (!messageText.trim() && !selectedFile)}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 text-white font-mono text-xs font-semibold uppercase tracking-wider rounded-none transition-colors border border-slate-900"
          >
            {sending ? 'TX...' : 'TRANSMIT'}
          </button>
        </div>
      </div>
    </div>
  );
}
