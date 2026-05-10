import { User, ChatRoom } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

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
    <div className="w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">{currentUser.display_name}</h2>
            <p className="text-xs text-zinc-500">@{currentUser.username}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-zinc-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full bg-white hover:bg-zinc-100 text-black font-medium py-2 px-4 rounded text-sm transition"
        >
          New Chat
        </button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 text-sm">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={`w-full p-4 text-left hover:bg-zinc-900 transition ${
                  selectedRoom?.id === room.id ? 'bg-zinc-900' : ''
                }`}
              >
                <div className="font-medium text-white text-sm truncate">
                  {getRoomName(room)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {new Date(room.updated_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
