import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/supabase';

interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'ciphervault-user',
    }
  )
);
