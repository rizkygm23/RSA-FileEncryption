'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { supabase, User, ChatRoom, Message } from '@/lib/supabase';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import NewChatModal from '@/components/chat/NewChatModal';

export default function ChatPage() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const logout = useUserStore((state) => state.logout);
  
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    loadData();
    
    // Subscribe to rooms
    const channel = supabase
      .channel('room-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms_kriptografi',
        },
        () => {
          loadRooms();
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, router]);

  const loadData = async () => {
    try {
      // Load all users
      const { data: usersData } = await supabase
        .from('users_kriptografi')
        .select('*')
        .order('username');
      
      if (usersData) setUsers(usersData);

      // Load user's rooms
      await loadRooms();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    if (!currentUser) return;

    const { data: memberData } = await supabase
      .from('room_members_kriptografi')
      .select('room_id')
      .eq('user_id', currentUser.id);

    if (memberData && memberData.length > 0) {
      const roomIds = memberData.map(m => m.room_id);
      const { data: roomsData } = await supabase
        .from('chat_rooms_kriptografi')
        .select('*')
        .in('id', roomIds)
        .order('updated_at', { ascending: false });

      if (roomsData) setRooms(roomsData);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNewChat = async (selectedUserIds: string[]) => {
    if (!currentUser || selectedUserIds.length === 0) return;

    try {
      // Generate RSA key pair for this room
      const { generateKey } = await import('@/services/api');
      const keys = await generateKey();

      // Create new room with key pair
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms_kriptografi')
        .insert({
          created_by: currentUser.id,
          public_key: keys.public_key,
          private_key: keys.private_key,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add members (current user + selected users)
      const members = [currentUser.id, ...selectedUserIds].map(userId => ({
        room_id: newRoom.id,
        user_id: userId,
      }));

      const { error: membersError } = await supabase
        .from('room_members_kriptografi')
        .insert(members);

      if (membersError) throw membersError;

      await loadRooms();
      setSelectedRoom(newRoom);
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
          INITIALIZING...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          currentUser={currentUser!}
          rooms={rooms}
          users={users}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
          onNewChat={() => setShowNewChatModal(true)}
          onLogout={handleLogout}
        />
        
        <ChatWindow
          currentUser={currentUser!}
          room={selectedRoom}
          users={users}
        />
      </div>

      {showNewChatModal && (
        <NewChatModal
          users={users.filter(u => u.id !== currentUser?.id)}
          onClose={() => setShowNewChatModal(false)}
          onCreateChat={handleNewChat}
        />
      )}
    </div>
  );
}
