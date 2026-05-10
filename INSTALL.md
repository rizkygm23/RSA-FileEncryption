# Installation Instructions

## Quick Start

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install:
- @supabase/supabase-js (Supabase client)
- zustand (State management)
- All existing dependencies

### 2. Setup Supabase Database

1. Go to Supabase SQL Editor: https://eldrxpulpluelgapyfjs.supabase.co
2. Copy content from `supabase-setup.sql`
3. Paste and run in SQL Editor

### 3. Create Storage Bucket

1. Go to Supabase Storage
2. Create new bucket: `chat-files-kriptografi`
3. Set as Private
4. Add storage policies (see CHAT_SETUP.md)

### 4. Start Backend

```bash
cd backend
python app.py
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

### 6. Access Application

- Main App: http://localhost:3000
- Login: http://localhost:3000/login
- Chat: http://localhost:3000/chat

## Test Users

Try logging in with these names:
- rizky
- aul
- irul
- cipa
- abi

Each user will automatically get RSA key pairs generated on first login.

## Features

✅ File Encryption/Decryption
✅ Digital Signatures
✅ Signature Verification
✅ **NEW: Secure Chat with E2E Encryption**
✅ **NEW: Encrypted File Sharing**
✅ **NEW: Real-time Messaging**

For detailed chat setup, see `CHAT_SETUP.md`
