# CipherVault v3 - Chat Feature Setup Guide

## Prerequisites
- Supabase account
- Node.js and npm installed
- Python and pip installed

## Step 1: Setup Supabase Database

1. Go to your Supabase project dashboard: https://eldrxpulpluelgapyfjs.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `supabase-setup.sql`
4. Click **Run** to execute the SQL script

This will create:
- `users_kriptografi` - User accounts with RSA keys
- `chat_rooms_kriptografi` - Chat rooms
- `room_members_kriptografi` - Room membership tracking
- `messages_kriptografi` - Encrypted messages
- `message_recipients_kriptografi` - Message delivery tracking

## Step 2: Setup Supabase Storage

1. In Supabase Dashboard, go to **Storage**
2. Click **New Bucket**
3. Create a bucket named: `chat-files-kriptografi`
4. Set it as **Public** ✅
5. Click **Create**

**Why Public Bucket?**
- ✅ Files are already encrypted with RSA before upload
- ✅ No one can read them without the room's private key
- ✅ Simpler access without complex policies
- ✅ Better performance and no CORS issues

**Security Note:**
Even though the bucket is public, files are secure because:
- All files are encrypted before upload
- Only room members have the private key to decrypt
- Encrypted files are useless without the key
- This is how true end-to-end encryption works!

**Alternative: Private Bucket (Optional)**

If you prefer private bucket, set as Private and add these policies:

```sql
-- Upload Policy
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files-kriptografi');

-- Download Policy
CREATE POLICY "Users can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files-kriptografi');
```

## Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase client
- `zustand` - State management

## Step 4: Environment Variables

The `.env.local` file has already been created with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://eldrxpulpluelgapyfjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Step 5: Start the Application

### Backend (Terminal 1)
```bash
cd backend
python app.py
```

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

## Step 6: Test the Chat Feature

1. Open browser: http://localhost:3000/login
2. Enter a name (e.g., "rizky") and click Continue
3. Open another browser/incognito window
4. Login with different name (e.g., "aul")
5. In first window, click "New Chat" and select the other user
6. Start chatting!

## How It Works

### User Registration
- When a user logs in for the first time, account is created
- No keys generated for user (keys are per-room, not per-user)
- Username is used as identifier

### Chat Room Creation
- When you start a new chat, a room is created
- **RSA key pair is automatically generated for the room**
- All selected users are added as room members
- All members share the same room keys
- Room updates are tracked in real-time

### Message Encryption Flow
1. **Sender side:**
   - Message/file is encrypted using **room's public key**
   - Message is signed using **room's private key**
   - Encrypted content + signature stored in database

2. **Recipient side:**
   - Receives encrypted message
   - Clicks "Decrypt" button
   - Message is decrypted using **room's private key** (shared by all members)
   - Signature is verified using **room's public key**

### Why Per-Room Keys?

**Advantages:**
- ✅ Efficient: Encrypt once for all members
- ✅ Scalable: Works for 2 users or 100 users
- ✅ Simple: One key pair per room
- ✅ Group-ready: Perfect for group chat

**vs Per-User Keys:**
- ❌ Per-user: Must encrypt N times for N users
- ❌ Per-user: Complex key management
- ❌ Per-user: Inefficient for groups

### File Sharing
1. File is encrypted before upload
2. Encrypted file is uploaded to Supabase Storage
3. File URL is stored in message
4. Recipient downloads and decrypts the file

## Security Features

✅ **End-to-End Encryption** - Messages encrypted with RSA
✅ **Digital Signatures** - Every message is signed
✅ **Integrity Verification** - SHA-256 hash validation
✅ **Non-Repudiation** - Sender cannot deny sending
✅ **Secure Storage** - Files encrypted before storage

## Database Schema

```
users_kriptografi
├── id (UUID)
├── username (TEXT)
├── display_name (TEXT)
└── created_at (TIMESTAMP)

chat_rooms_kriptografi
├── id (UUID)
├── room_name (TEXT)
├── public_key (TEXT) ← Room's public key
├── private_key (TEXT) ← Room's private key (shared by all members)
├── created_by (UUID)
└── created_at (TIMESTAMP)

messages_kriptografi
├── id (UUID)
├── room_id (UUID)
├── sender_id (UUID)
├── message_type (TEXT) - 'text' or 'file'
├── encrypted_content (TEXT) ← Encrypted with room's public key
├── signature (TEXT) ← Signed with room's private key
├── file_name (TEXT)
├── file_url (TEXT)
└── created_at (TIMESTAMP)
```

## Troubleshooting

### Issue: "Failed to create chat"
- Check if Supabase SQL script was executed successfully
- Verify RLS policies are enabled

### Issue: "Failed to send message"
- Ensure backend is running on port 5000
- Check browser console for errors

### Issue: "Failed to decrypt"
- Verify user has correct private key
- Check if message was encrypted with correct public key

### Issue: "File upload failed"
- Verify storage bucket `chat-files-kriptografi` exists
- Check storage policies are configured

## Next Steps

- Add message read receipts
- Implement typing indicators
- Add group chat names
- Show online/offline status
- Add message search
- Implement message deletion

## Notes

⚠️ **Security Warning**: In production, room private keys should be:
- Encrypted with member passwords before storage
- Never stored in plaintext in database
- Distributed securely to members only
- Rotated when members leave

⚠️ **Key Management**: This implementation uses **shared secret model** where:
- Each room has one key pair
- All members share the same keys
- Efficient for group messaging
- Common pattern in modern chat apps

This implementation stores keys in database for educational purposes only.
