'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, MessageCircle, Paperclip, Send, X } from 'lucide-react';

import { ChatRoom, Message, User } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { encryptFile, signFile } from '@/services/api';
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
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async () => {
    if (!room) return;

    const { data } = await supabase
      .from('messages_kriptografi')
      .select('*')
      .eq('room_id', room.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  }, [room]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom, scrollToBottom]);

  useEffect(() => {
    if (!room) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMessages();

    const channel = supabase
      .channel(`room_${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages_kriptografi',
          filter: `room_id=eq.${room.id}`,
        },
        () => {
          void loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages, room]);

  const getRoomMembers = async () => {
    if (!room) return [];

    const { data } = await supabase
      .from('room_members_kriptografi')
      .select('user_id')
      .eq('room_id', room.id);

    return data?.map((m) => m.user_id) || [];
  };

  const sendTextMessage = async () => {
    if (!messageText.trim() || !room) return;

    try {
      setSending(true);

      const memberIds = await getRoomMembers();
      const textBlob = new Blob([messageText], { type: 'text/plain' });
      const textFile = new File([textBlob], 'message.txt');
      const publicKeyBlob = new Blob([room.public_key], { type: 'text/plain' });
      const publicKeyFile = new File([publicKeyBlob], 'public_key.txt');
      const encryptedBlob = await encryptFile(textFile, publicKeyFile);
      const encryptedText = await encryptedBlob.text();

      const privateKeyBlob = new Blob([room.private_key], { type: 'text/plain' });
      const privateKeyFile = new File([privateKeyBlob], 'private_key.txt');
      const signatureBlob = await signFile(textFile, privateKeyFile);
      const signature = await signatureBlob.text();

      const { data: newMessage, error } = await supabase
        .from('messages_kriptografi')
        .insert({
          room_id: room.id,
          sender_id: currentUser.id,
          message_type: 'text',
          encrypted_content: encryptedText,
          signature,
        })
        .select()
        .single();

      if (error) throw error;

      const recipientRecords = memberIds
        .filter((id) => id !== currentUser.id)
        .map((id) => ({
          message_id: newMessage.id,
          recipient_id: id,
        }));

      if (recipientRecords.length > 0) {
        await supabase
          .from('message_recipients_kriptografi')
          .insert(recipientRecords);
      }

      setMessageText('');
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

      const memberIds = await getRoomMembers();
      const publicKeyBlob = new Blob([room.public_key], { type: 'text/plain' });
      const publicKeyFile = new File([publicKeyBlob], 'public_key.txt');
      const encryptedBlob = await encryptFile(selectedFile, publicKeyFile);

      const fileName = `${room.id}/${Date.now()}-${selectedFile.name}.encrypted`;
      const { error: uploadError } = await supabase.storage
        .from('chat-files-kriptografi')
        .upload(fileName, encryptedBlob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-files-kriptografi')
        .getPublicUrl(fileName);

      const privateKeyBlob = new Blob([room.private_key], { type: 'text/plain' });
      const privateKeyFile = new File([privateKeyBlob], 'private_key.txt');
      const signatureBlob = await signFile(selectedFile, privateKeyFile);
      const signature = await signatureBlob.text();

      const { data: newMessage, error } = await supabase
        .from('messages_kriptografi')
        .insert({
          room_id: room.id,
          sender_id: currentUser.id,
          message_type: 'file',
          encrypted_content: urlData.publicUrl,
          signature,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_url: urlData.publicUrl,
        })
        .select()
        .single();

      if (error) throw error;

      const recipientRecords = memberIds
        .filter((id) => id !== currentUser.id)
        .map((id) => ({
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
      void sendFileMessage();
    } else {
      void sendTextMessage();
    }
  };

  if (!room) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#f3f3f3] p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#efefef] text-[#5e5e5e]">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-black">Select a chat</h3>
          <p className="text-sm text-[#5e5e5e]">Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f3f3f3]">
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#efefef] text-[#5e5e5e]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <p className="mb-1 text-sm font-medium text-black">No messages yet</p>
              <p className="text-xs text-[#5e5e5e]">Send a message to start the conversation</p>
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

      <div className="shrink-0 border-t border-[#e2e2e2] bg-white p-4">
        {selectedFile && (
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#e2e2e2] bg-[#efefef] p-3">
            <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-black">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
            </span>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5e5e5e] transition-colors hover:bg-white hover:text-black"
              aria-label="Remove selected file"
            >
              <X className="h-4 w-4" />
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
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#efefef] text-black transition-colors hover:bg-[#e2e2e2] disabled:opacity-50"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            disabled={sending || !!selectedFile}
            className="min-w-0 flex-1 rounded-full border border-[#e2e2e2] bg-[#efefef] px-4 py-3 text-sm text-black placeholder-[#5e5e5e] transition-shadow focus:border-black focus:outline-none focus:ring-2 focus:ring-black disabled:bg-[#f3f3f3] disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={sending || (!messageText.trim() && !selectedFile)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:border-[#e2e2e2] disabled:bg-[#efefef] disabled:text-[#afafaf]"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
