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
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-10 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-[10px] font-mono font-bold uppercase text-slate-500 hover:text-indigo-600 transition-colors">
            ← BACK TO DASHBOARD
          </Link>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-sm text-slate-900 uppercase tracking-tight">{currentUser.display_name}</h2>
            <p className="text-[10px] font-mono text-slate-500">@{currentUser.username}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-[10px] font-mono font-bold uppercase text-slate-400 hover:text-slate-700 transition"
          >
            LOGOUT
          </button>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold py-2 px-4 border border-slate-900 transition-colors"
        >
          NEW CHAT
        </button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs font-mono">
            NO CHATS YET.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition border-l-2 ${
                  selectedRoom?.id === room.id ? 'bg-slate-50 border-slate-900' : 'border-transparent'
                }`}
              >
                <div className="font-semibold text-slate-900 text-sm truncate uppercase tracking-tight">
                  {getRoomName(room)}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                  LAST UPDATED: {new Date(room.updated_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
