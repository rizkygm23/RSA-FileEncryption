import { User, ChatRoom } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut, MessageCircle, Plus } from 'lucide-react';

interface ChatSidebarProps {
  currentUser: User;
  rooms: ChatRoom[];
  users: User[];
  selectedRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
  onNewChat: () => void;
  onLogout: () => void;
}

export default function ChatSidebar({
  currentUser,
  rooms,
  users,
  selectedRoom,
  onSelectRoom,
  onNewChat,
  onLogout,
}: ChatSidebarProps) {
  const [roomMembers, setRoomMembers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let isMounted = true;

    const loadRoomMembers = async () => {
      const membersMap: Record<string, string[]> = {};

      for (const room of rooms) {
        const { data } = await supabase
          .from('room_members_kriptografi')
          .select('user_id')
          .eq('room_id', room.id);

        if (data) {
          membersMap[room.id] = data.map(m => m.user_id);
        }
      }

      if (isMounted) setRoomMembers(membersMap);
    };

    loadRoomMembers();

    return () => {
      isMounted = false;
    };
  }, [rooms]);

  const getRoomName = (room: ChatRoom) => {
    if (room.room_name) return room.room_name;

    const memberIds = roomMembers[room.id] || [];
    const otherMembers = memberIds
      .filter(id => id !== currentUser.id)
      .map(id => users.find(u => u.id === id)?.display_name)
      .filter(Boolean);

    return otherMembers.join(', ') || 'Chat Room';
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-[#e2e2e2] bg-white sm:w-80 lg:w-72">
      <div className="shrink-0 border-b border-[#e2e2e2] p-4">
        <div className="mb-3 sm:mb-4">
          <Link 
            href="/" 
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#efefef] px-3 text-xs font-medium text-black transition-colors hover:bg-[#e2e2e2]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="font-medium">Dashboard</span>
          </Link>
        </div>
        
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
              {currentUser.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-black">{currentUser.display_name}</h2>
              <div className="flex items-center gap-1.5">
                <div className="status-dot status-online" />
                <span className="text-xs text-[#5e5e5e]">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#5e5e5e] transition-colors hover:bg-[#efefef] hover:text-black"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={onNewChat}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#282828]"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#efefef] text-[#5e5e5e]">
              <MessageCircle className="h-6 w-6" />
            </div>
            <p className="mb-1 text-sm font-medium text-black">No chats yet</p>
            <p className="text-xs text-[#5e5e5e]">Create a chat to start.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#efefef]">
            {rooms.map((room) => {
              const isActive = selectedRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className={`
                    relative w-full p-3 text-left transition-colors
                    ${isActive 
                      ? 'bg-[#efefef]' 
                      : 'hover:bg-[#f3f3f3]'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-black" />
                  )}
                  <div className="flex items-center gap-3 pl-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                      {getRoomName(room).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-0.5 truncate text-sm font-medium text-black">
                        {getRoomName(room)}
                      </div>
                      <div className="text-xs text-[#5e5e5e]">
                        {new Date(room.updated_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
