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
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to CipherVault</h1>
          <p className="text-zinc-400">Enter your name to start secure messaging</p>
        </div>

        <div className="card-dark p-8 rounded-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., rizky, aul, irul, cipa, abi"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-950/50 p-3 rounded border border-red-900">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-medium py-3 px-4 rounded transition"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 text-center">
              Each chat room will have its own RSA key pair for secure group messaging
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
