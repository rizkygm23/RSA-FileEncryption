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
      <div className="bg-white border border-slate-200 shadow-xl rounded-none max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">New Transmission Channel</h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">Select recipients to establish a secure connection</p>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-slate-500 text-center font-mono text-xs uppercase">No other operators available</p>
          ) : (
            <div className="space-y-1">
              {users.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center gap-3 p-3 border hover:border-slate-300 cursor-pointer transition-colors ${selectedUsers.includes(user.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent'}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4 accent-indigo-600 rounded-none"
                  />
                  <div>
                    <div className="text-slate-900 text-sm font-semibold uppercase">{user.display_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">@{user.username}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-semibold uppercase tracking-wider rounded-none transition-colors border border-slate-200"
          >
            ABORT
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0}
            className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 text-white font-mono text-xs font-semibold uppercase tracking-wider rounded-none transition-colors border border-slate-900"
          >
            INITIATE
          </button>
        </div>
      </div>
    </div>
  );
}
