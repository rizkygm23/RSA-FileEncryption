import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  },
});

// Types
export interface User {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
  last_seen: string;
}

export interface ChatRoom {
  id: string;
  room_name: string | null;
  direct_pair_key?: string | null;
  public_key: string;
  private_key: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message_type: 'text' | 'file';
  encrypted_content: string;
  signature: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  created_at: string;
  is_deleted: boolean;
}

export interface MessageRecipient {
  id: string;
  message_id: string;
  recipient_id: string;
  is_read: boolean;
  read_at?: string;
}
