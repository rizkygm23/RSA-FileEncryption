'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { supabase, User, ChatRoom } from '@/lib/supabase';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import NewChatModal from '@/components/chat/NewChatModal';
import { Menu } from 'lucide-react';

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

  const loadRooms = useCallback(async () => {
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
    } else {
      setRooms([]);
    }
  }, [currentUser]);

  const loadData = useCallback(async () => {
    try {
      const { data: usersData } = await supabase
        .from('users_kriptografi')
        .select('*')
        .order('username');
      
      if (usersData) setUsers(usersData);
      await loadRooms();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadRooms]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, loadData, loadRooms, router]);

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
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f3f3f3]">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#e2e2e2]" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-black border-t-transparent" />
          </div>
          <p className="mb-1 text-sm font-medium text-black">Loading CipherVault</p>
          <p className="text-xs text-[#5e5e5e]">Initializing secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 flex flex-col bg-[#f3f3f3]" style={{ top: '64px' }}>
      <div className="flex shrink-0 items-center justify-between border-b border-[#e2e2e2] bg-white px-4 py-3 lg:hidden">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-black transition-colors hover:bg-[#efefef]"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-black sm:text-base">
          {selectedRoom ? 'Chat' : 'Select Channel'}
        </span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-0">
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

        {showSidebar && (
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
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
