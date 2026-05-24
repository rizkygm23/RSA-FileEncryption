import { useEffect, useRef, useState } from 'react';
import { User } from '@/lib/supabase';
import { Check, X } from 'lucide-react';

interface NewChatModalProps {
  users: User[];
  onClose: () => void;
  onCreateChat: (selectedUserIds: string[]) => void | Promise<void>;
}

export default function NewChatModal({ users, onClose, onCreateChat }: NewChatModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0 || creating) return;

    setCreating(true);
    try {
      await onCreateChat(selectedUsers);
    } finally {
      if (isMounted.current) setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.16)]">
        <div className="shrink-0 border-b border-[#e2e2e2] p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-black">New chat</h2>
          <p className="mt-1 text-sm text-[#5e5e5e]">Choose people for this room.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#5e5e5e]">No other users available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <label
                  key={user.id}
                  className={`
                    flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors
                    ${selectedUsers.includes(user.id) 
                      ? 'bg-[#efefef] border-black' 
                      : 'bg-white border-[#e2e2e2] hover:bg-[#f3f3f3]'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="h-4 w-4 accent-black"
                  />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black">{user.display_name}</div>
                    <div className="text-xs text-[#5e5e5e]">@{user.username}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-3 border-t border-[#e2e2e2] p-4 sm:p-6">
          <button
            onClick={onClose}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#e2e2e2] bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#efefef]"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || creating}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:bg-[#efefef] disabled:text-[#afafaf]"
          >
            <Check className="h-4 w-4" />
            {creating ? 'Creating...' : 'Create chat'}
          </button>
        </div>
      </div>
    </div>
  );
}
