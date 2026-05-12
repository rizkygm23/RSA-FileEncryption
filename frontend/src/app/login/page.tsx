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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to CipherVault</h1>
          <p className="text-slate-600">Enter your name to start secure messaging</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., rizky, aul, irul, cipa, abi"
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Each chat room will have its own RSA key pair for secure group messaging
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
