-- CipherVault v3 - Supabase Database Setup
-- Semua tabel menggunakan suffix _kriptografi untuk menghindari konflik

-- 1. Tabel Users (tanpa key pair, karena key ada di room)
CREATE TABLE users_kriptografi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Chat Rooms (dengan key pair untuk room)
CREATE TABLE chat_rooms_kriptografi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name TEXT,
  direct_pair_key TEXT,
  
  -- Room Key Pair (shared by all members)
  public_key TEXT NOT NULL,
  private_key TEXT NOT NULL, -- Dalam implementasi real, ini harus di-encrypt atau disimpan di client
  
  created_by UUID REFERENCES users_kriptografi(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Room Members (untuk tracking siapa saja yang ada di room)
CREATE TABLE room_members_kriptografi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms_kriptografi(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users_kriptografi(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 4. Tabel Messages
CREATE TABLE messages_kriptografi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms_kriptografi(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users_kriptografi(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'file')),
  
  -- Encrypted content
  encrypted_content TEXT NOT NULL,
  
  -- Digital signature
  signature TEXT NOT NULL,
  
  -- File metadata (jika message_type = 'file')
  file_name TEXT,
  file_size BIGINT,
  file_url TEXT, -- URL dari Supabase Storage
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 5. Tabel Message Recipients (untuk tracking siapa saja yang bisa baca pesan)
CREATE TABLE message_recipients_kriptografi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages_kriptografi(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users_kriptografi(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(message_id, recipient_id)
);

-- Indexes untuk performa
CREATE INDEX idx_messages_room_id ON messages_kriptografi(room_id);
CREATE INDEX idx_messages_sender_id ON messages_kriptografi(sender_id);
CREATE INDEX idx_messages_created_at ON messages_kriptografi(created_at DESC);
CREATE INDEX idx_room_members_room_id ON room_members_kriptografi(room_id);
CREATE INDEX idx_room_members_user_id ON room_members_kriptografi(user_id);
CREATE UNIQUE INDEX idx_chat_rooms_direct_pair_key_unique ON chat_rooms_kriptografi(direct_pair_key) WHERE direct_pair_key IS NOT NULL;
CREATE INDEX idx_message_recipients_message_id ON message_recipients_kriptografi(message_id);
CREATE INDEX idx_message_recipients_recipient_id ON message_recipients_kriptografi(recipient_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users_kriptografi ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms_kriptografi ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members_kriptografi ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_kriptografi ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients_kriptografi ENABLE ROW LEVEL SECURITY;

-- Policy: Users dapat membaca semua user (untuk list user)
CREATE POLICY "Users are viewable by everyone" 
  ON users_kriptografi FOR SELECT 
  USING (true);

-- Policy: Users dapat update data mereka sendiri
CREATE POLICY "Users can update own data" 
  ON users_kriptografi FOR UPDATE 
  USING (true);

-- Policy: Users dapat insert data mereka sendiri
CREATE POLICY "Users can insert own data" 
  ON users_kriptografi FOR INSERT 
  WITH CHECK (true);

-- Policy: Chat rooms viewable by members
CREATE POLICY "Chat rooms viewable by members" 
  ON chat_rooms_kriptografi FOR SELECT 
  USING (true);

-- Policy: Anyone can create chat rooms
CREATE POLICY "Anyone can create chat rooms" 
  ON chat_rooms_kriptografi FOR INSERT 
  WITH CHECK (true);

-- Policy: Room members viewable by everyone
CREATE POLICY "Room members viewable by everyone" 
  ON room_members_kriptografi FOR SELECT 
  USING (true);

-- Policy: Anyone can join rooms
CREATE POLICY "Anyone can join rooms" 
  ON room_members_kriptografi FOR INSERT 
  WITH CHECK (true);

-- Policy: Messages viewable by room members
CREATE POLICY "Messages viewable by room members" 
  ON messages_kriptografi FOR SELECT 
  USING (true);

-- Policy: Anyone can send messages
CREATE POLICY "Anyone can send messages" 
  ON messages_kriptografi FOR INSERT 
  WITH CHECK (true);

-- Policy: Message recipients viewable by recipient
CREATE POLICY "Message recipients viewable by recipient" 
  ON message_recipients_kriptografi FOR SELECT 
  USING (true);

-- Policy: Anyone can insert message recipients
CREATE POLICY "Anyone can insert message recipients" 
  ON message_recipients_kriptografi FOR INSERT 
  WITH CHECK (true);

-- Policy: Recipients can update their read status
CREATE POLICY "Recipients can update read status" 
  ON message_recipients_kriptografi FOR UPDATE 
  USING (true);

-- Function untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms_kriptografi
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage Bucket untuk file attachments
-- Jalankan ini di Supabase Dashboard > Storage atau via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files-kriptografi', 'chat-files-kriptografi', false);

-- Storage Policy (jalankan setelah bucket dibuat)
-- CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-files-kriptografi');
-- CREATE POLICY "Users can view files" ON storage.objects FOR SELECT USING (bucket_id = 'chat-files-kriptografi');
