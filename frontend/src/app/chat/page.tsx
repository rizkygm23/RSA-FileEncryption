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
  const [showSidebar, setShowSidebar] = useState(false);

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
      setShowSidebar(false); // Close sidebar on mobile after selecting
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setShowSidebar(false); // Close sidebar on mobile after selecting
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-slate-900 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-900 mb-1">Loading CipherVault</p>
          <p className="text-xs text-slate-500">Initializing secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50" style={{ top: '64px' }}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="touch-target p-2 hover:bg-slate-100 rounded-lg transition-colors -ml-2"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-slate-900 text-sm sm:text-base">
          {selectedRoom ? 'Chat' : 'Select Channel'}
        </span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Sidebar - Desktop: always visible, Mobile: overlay */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:relative
          inset-y-0 left-0
          z-40
          w-full sm:w-80 lg:w-72
          transition-transform duration-300 ease-in-out
        `}>
          <ChatSidebar
            currentUser={currentUser!}
            rooms={rooms}
            users={users}
            selectedRoom={selectedRoom}
            onSelectRoom={handleSelectRoom}
            onNewChat={() => setShowNewChatModal(true)}
            onLogout={handleLogout}
          />
        </div>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-30"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            currentUser={currentUser!}
            room={selectedRoom}
            users={users}
          />
        </div>
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
