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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 shadow-xl rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">New Chat</h2>
          <p className="text-sm text-slate-500 mt-1">Select people to start a conversation</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No other users available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <label
                  key={user.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${selectedUsers.includes(user.id) 
                      ? 'bg-slate-50 border-slate-900' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4 accent-slate-900 rounded"
                  />
                  <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 text-sm font-semibold shrink-0">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{user.display_name}</div>
                    <div className="text-xs text-slate-500">@{user.username}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-200 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg transition-colors border border-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0}
            className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-sm rounded-lg transition-colors"
          >
            Create Chat
          </button>
        </div>
      </div>
    </div>
  );
}
