'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users_kriptografi')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        // User exists, login
        setCurrentUser(existingUser);
        router.push('/chat');
      } else {
        // New user, create account (no keys needed, keys are per-room)
        const { data: newUser, error: insertError } = await supabase
          .from('users_kriptografi')
          .insert({
            username: username.toLowerCase(),
            display_name: username,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setCurrentUser(newUser);
        router.push('/chat');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f3f3f3] px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold leading-[44px] text-black">Welcome to CipherVault</h1>
          <p className="text-base text-[#5e5e5e]">Enter your name to start secure messaging</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.16)] sm:p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-[#5e5e5e]">
                Your name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., rizky, aul, irul, cipa, abi"
                className="input"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-black bg-[#efefef] p-4 text-sm text-black">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:bg-[#efefef] disabled:text-[#afafaf]"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#e2e2e2] pt-6">
            <p className="text-center text-xs text-[#5e5e5e]">
              Each chat room will have its own RSA key pair for secure group messaging
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
