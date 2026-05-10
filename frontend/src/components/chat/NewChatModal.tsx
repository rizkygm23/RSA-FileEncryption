import { useState } from 'react';
import { User } from '@/lib/supabase';

interface NewChatModalProps {
  users: User[];
  onClose: () => void;
  onCreateChat: (selectedUserIds: string[]) => void;
}

export default function NewChatModal({ users, onClose, onCreateChat }: NewChatModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (selectedUsers.length > 0) {
      onCreateChat(selectedUsers);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">New Chat</h2>
          <p className="text-sm text-zinc-400 mt-1">Select users to start a conversation</p>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-zinc-500 text-center">No other users available</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="text-white font-medium">{user.display_name}</div>
                    <div className="text-xs text-zinc-500">@{user.username}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0}
            className="flex-1 px-4 py-2 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-medium rounded transition"
          >
            Create Chat
          </button>
        </div>
      </div>
    </div>
  );
}
