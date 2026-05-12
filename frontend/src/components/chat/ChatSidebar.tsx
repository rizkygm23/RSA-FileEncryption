import { User, ChatRoom } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    loadRoomMembers();
  }, [rooms]);

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

    setRoomMembers(membersMap);
  };

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
    <div className="w-full sm:w-80 lg:w-72 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 shrink-0">
        <div className="mb-3 sm:mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors group touch-target"
          >
            <svg className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </Link>
        </div>
        
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              {currentUser.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm text-slate-900 truncate">{currentUser.display_name}</h2>
              <div className="flex items-center gap-1.5">
                <div className="status-dot status-online" />
                <span className="text-xs text-slate-500">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="touch-target p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full touch-target bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors interactive"
        >
          New Chat
        </button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">No chats yet</p>
            <p className="text-xs text-slate-500">Click "New Chat" to start</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rooms.map((room) => {
              const isActive = selectedRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className={`
                    w-full p-3 text-left transition-colors relative touch-target
                    ${isActive 
                      ? 'bg-slate-50' 
                      : 'hover:bg-slate-50'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-900" />
                  )}
                  <div className="flex items-center gap-3 pl-0">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 text-sm font-semibold shrink-0">
                      {getRoomName(room).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900 truncate mb-0.5">
                        {getRoomName(room)}
                      </div>
                      <div className="text-xs text-slate-500">
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
