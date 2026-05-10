# Troubleshooting Guide

## Error: "Network Error" saat Decrypt

### Penyebab
Backend Flask tidak berjalan atau tidak dapat diakses dari frontend.

### Solusi

#### 1. Pastikan Backend Berjalan

Buka terminal baru dan jalankan:

```bash
cd backend
python app.py
```

Anda harus melihat output seperti:
```
 * Running on http://127.0.0.1:5000
 * Restarting with stat
 * Debugger is active!
```

#### 2. Test Backend Endpoint

Buka browser dan akses:
```
http://localhost:5000/api/generate-key
```

Jika backend berjalan, Anda akan melihat JSON response dengan keys.

#### 3. Cek CORS

Pastikan `flask-cors` terinstall:
```bash
pip install flask-cors
```

#### 4. Cek Port

Pastikan port 5000 tidak digunakan aplikasi lain:

**Windows:**
```cmd
netstat -ano | findstr :5000
```

Jika ada aplikasi lain, stop aplikasi tersebut atau ubah port di:
- `backend/app.py` (line terakhir: `app.run(debug=True, port=5000)`)
- `frontend/.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:5000`)

#### 5. Restart Backend

Jika backend sudah berjalan tapi masih error:
1. Stop backend (Ctrl+C)
2. Start lagi: `python app.py`

---

## Error: "Failed to create chat"

### Penyebab
Database schema belum dijalankan atau ada error di Supabase.

### Solusi

1. Buka Supabase SQL Editor
2. Drop existing tables:
```sql
DROP TABLE IF EXISTS message_recipients_kriptografi CASCADE;
DROP TABLE IF EXISTS messages_kriptografi CASCADE;
DROP TABLE IF EXISTS room_members_kriptografi CASCADE;
DROP TABLE IF EXISTS chat_rooms_kriptografi CASCADE;
DROP TABLE IF EXISTS users_kriptografi CASCADE;
```

3. Jalankan `supabase-setup.sql` lengkap

4. Verify tables created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%kriptografi%';
```

---

## Error: "File upload failed"

### Penyebab
Storage bucket belum dibuat atau policies belum dikonfigurasi.

### Solusi

1. Buka Supabase Dashboard → Storage
2. Create bucket: `chat-files-kriptografi`
3. Set as **Private**
4. Add policies di SQL Editor:

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

## Error: "Cannot read properties of undefined"

### Penyebab
Data belum loaded atau null reference.

### Solusi

1. Clear browser cache dan localStorage:
```javascript
// Di browser console:
localStorage.clear();
location.reload();
```

2. Logout dan login kembali

---

## Chat tidak real-time / Messages tidak muncul

### Penyebab
Supabase Realtime tidak enabled atau subscription error.

### Solusi

1. Buka Supabase Dashboard → Database → Replication
2. Enable replication untuk tables:
   - `chat_rooms_kriptografi`
   - `messages_kriptografi`

3. Refresh browser

---

## Backend Error: "ModuleNotFoundError"

### Penyebab
Dependencies belum terinstall.

### Solusi

```bash
cd backend
pip install flask flask-cors
```

Atau install dari requirements.txt:
```bash
pip install -r requirements.txt
```

---

## Frontend Error: "Module not found"

### Penyebab
Dependencies belum terinstall.

### Solusi

```bash
cd frontend
npm install
```

Jika masih error, hapus node_modules dan install ulang:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Decrypt tidak bekerja / "Invalid key format"

### Penyebab
Key format tidak sesuai atau menggunakan key yang salah.

### Solusi

1. Pastikan menggunakan **Room Private Key** untuk decrypt
2. Key format harus:
```
n = 3233
d = 2753
```

3. Jangan gunakan User Private Key (sudah tidak ada)

---

## Performance Issues / Slow Encryption

### Penyebab
RSA dengan key size kecil (n=3233) hanya untuk demo.

### Solusi

Untuk production, gunakan key size lebih besar:

Edit `backend/rsa_utils.py`:
```python
# Ganti p dan q dengan prime numbers lebih besar
# Contoh: p=1009, q=1013 → n=1,022,117
```

**Note:** Key size lebih besar = lebih secure tapi lebih lambat.

---

## Quick Checklist

Sebelum mulai testing, pastikan:

- [ ] Backend running di port 5000
- [ ] Frontend running di port 3000
- [ ] Supabase tables created
- [ ] Storage bucket created
- [ ] Storage policies configured
- [ ] Dependencies installed (frontend & backend)
- [ ] .env.local configured dengan Supabase credentials

---

## Still Having Issues?

1. Check browser console (F12) untuk error messages
2. Check backend terminal untuk error logs
3. Check Supabase logs di Dashboard → Logs
4. Verify network requests di browser DevTools → Network tab

---

## Common Commands

**Start Backend:**
```bash
cd backend
python app.py
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Reset Database:**
```sql
-- Di Supabase SQL Editor
DROP TABLE IF EXISTS message_recipients_kriptografi CASCADE;
DROP TABLE IF EXISTS messages_kriptografi CASCADE;
DROP TABLE IF EXISTS room_members_kriptografi CASCADE;
DROP TABLE IF EXISTS chat_rooms_kriptografi CASCADE;
DROP TABLE IF EXISTS users_kriptografi CASCADE;

-- Kemudian jalankan supabase-setup.sql
```

**Clear Browser Data:**
```javascript
// Di browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```
