# Verify Setup Checklist

## ✅ Step-by-Step Verification

### 1. Database Tables

Buka Supabase SQL Editor dan jalankan:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%kriptografi%'
ORDER BY table_name;
```

**Expected Output:**
```
chat_rooms_kriptografi
message_recipients_kriptografi
messages_kriptografi
room_members_kriptografi
users_kriptografi
```

✅ Jika semua 5 tables ada, database OK!

---

### 2. Storage Bucket

Buka Supabase Dashboard → Storage

**Check:**
- [ ] Bucket `chat-files-kriptografi` exists
- [ ] Bucket is **Private** (not public)
- [ ] Bucket has policies configured

**Verify Policies:**

```sql
SELECT * FROM storage.policies 
WHERE bucket_id = 'chat-files-kriptografi';
```

**Expected:** 2 policies (INSERT and SELECT)

---

### 3. Storage Policies

Jika policies belum ada, jalankan:

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

---

### 4. Backend Running

**Check Backend:**

```bash
# Windows
netstat -ano | findstr :5000

# Should show process on port 5000
```

**Test API:**

Open browser: http://localhost:5000/api/generate-key

**Expected:** JSON with public_key and private_key

---

### 5. Frontend Running

**Check Frontend:**

```bash
# Windows
netstat -ano | findstr :3000

# Should show process on port 3000
```

**Test App:**

Open browser: http://localhost:3000

**Expected:** Homepage loads

---

### 6. Environment Variables

**Check `.env.local`:**

```bash
cd frontend
type .env.local
```

**Expected:**
```
NEXT_PUBLIC_SUPABASE_URL=https://eldrxpulpluelgapyfjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### 7. Dependencies

**Backend:**
```bash
cd backend
pip show flask flask-cors
```

**Frontend:**
```bash
cd frontend
npm list @supabase/supabase-js zustand
```

---

## 🧪 Functional Tests

### Test 1: User Login

1. Go to: http://localhost:3000/login
2. Enter name: `test1`
3. Click Continue

**Expected:** Redirect to /chat

**Verify in Supabase:**
```sql
SELECT * FROM users_kriptografi WHERE username = 'test1';
```

---

### Test 2: Create Chat Room

1. Click "New Chat"
2. Login as `test2` in another browser
3. Select `test2` from list
4. Click "Create Chat"

**Expected:** Chat room created

**Verify in Supabase:**
```sql
SELECT * FROM chat_rooms_kriptografi 
ORDER BY created_at DESC 
LIMIT 1;
```

**Check:** Room has `public_key` and `private_key`

---

### Test 3: Send Text Message

1. Type: "Hello World"
2. Click Send

**Expected:** Message appears as "🔒 Encrypted message"

**Verify in Supabase:**
```sql
SELECT * FROM messages_kriptografi 
WHERE message_type = 'text'
ORDER BY created_at DESC 
LIMIT 1;
```

**Check:** 
- `encrypted_content` is comma-separated numbers
- `signature` exists

---

### Test 4: Decrypt Text Message

1. Click "Decrypt" button
2. Wait for decryption

**Expected:** Shows "Hello World"

**Check Backend Logs:**
- Should see: `POST /chat/decrypt-text HTTP/1.1" 200`
- No errors

---

### Test 5: Send File

1. Click 📎 icon
2. Select small file (< 1MB)
3. Click Send

**Expected:** File uploads and message appears

**Verify in Supabase Storage:**

Go to: Storage → chat-files-kriptografi

**Check:** File exists with `.encrypted` extension

**Verify in Database:**
```sql
SELECT * FROM messages_kriptografi 
WHERE message_type = 'file'
ORDER BY created_at DESC 
LIMIT 1;
```

**Check:**
- `file_url` points to storage
- `file_name` is original name
- `file_size` is correct

---

### Test 6: Download & Decrypt File

1. Click "Download & Decrypt"
2. Wait for download

**Expected:** Original file downloads

**Check Backend Logs:**
- Should see: `POST /decrypt HTTP/1.1" 200`
- No errors

---

## 🐛 Common Issues

### Issue: "File not found in storage"

**Cause:** Storage bucket not created or file upload failed

**Fix:**
1. Create bucket: `chat-files-kriptografi`
2. Set as Private
3. Add policies (see step 3 above)

---

### Issue: "Invalid encrypted file format"

**Cause:** File from Supabase is JSON error, not encrypted data

**Fix:**
1. Check if file exists in Storage
2. Verify file URL is correct
3. Check storage policies allow download

---

### Issue: "Backend not responding"

**Cause:** Backend not running or wrong port

**Fix:**
```bash
cd backend
python app.py
```

Check: http://localhost:5000/api/generate-key

---

### Issue: "Decryption failed"

**Cause:** Wrong key or corrupted data

**Fix:**
1. Verify room has keys:
```sql
SELECT id, public_key, private_key 
FROM chat_rooms_kriptografi;
```

2. Check encrypted_content format:
```sql
SELECT encrypted_content 
FROM messages_kriptografi 
LIMIT 1;
```

Should be: `123,456,789,...`

---

## 📊 Health Check Summary

Run all checks and mark:

- [ ] Database tables created (5 tables)
- [ ] Storage bucket created
- [ ] Storage policies configured
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Can create user
- [ ] Can create chat room
- [ ] Can send text message
- [ ] Can decrypt text message
- [ ] Can send file
- [ ] Can download & decrypt file

**If all checked:** System is working! ✅

**If any failed:** See TROUBLESHOOTING.md

---

## 🔍 Debug Commands

**Check Supabase Connection:**
```javascript
// In browser console on http://localhost:3000
const { data, error } = await supabase
  .from('users_kriptografi')
  .select('*')
  .limit(1);
console.log(data, error);
```

**Check Storage Access:**
```javascript
// In browser console
const { data, error } = await supabase.storage
  .from('chat-files-kriptografi')
  .list();
console.log(data, error);
```

**Test Backend:**
```bash
curl http://localhost:5000/api/generate-key
```

---

## 📞 Still Having Issues?

1. Check browser console (F12)
2. Check backend terminal logs
3. Check Supabase logs (Dashboard → Logs)
4. See TROUBLESHOOTING.md
5. See BUGFIX-DECRYPT.md for decryption issues
