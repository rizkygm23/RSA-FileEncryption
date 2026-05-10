# Quick Start Guide - CipherVault v3

## 🚀 Cara Tercepat untuk Mulai

### Step 1: Setup Database (Sekali saja)

1. Buka Supabase SQL Editor: https://eldrxpulpluelgapyfjs.supabase.co
2. Copy semua isi file `supabase-setup.sql`
3. Paste di SQL Editor
4. Klik **Run**
5. Tunggu sampai selesai (akan muncul "Success")

### Step 2: Setup Storage (Sekali saja)

1. Buka Supabase Dashboard → **Storage**
2. Klik **New Bucket**
3. Nama: `chat-files-kriptografi`
4. Public: **ON** ✅ (Aman karena file sudah terenkripsi)
5. Klik **Create**

**Kenapa Public?**
File sudah terenkripsi dengan RSA sebelum upload, jadi aman untuk public bucket. Hanya yang punya private key yang bisa decrypt!

### Step 3: Install Dependencies (Sekali saja)

**Backend:**
```bash
cd backend
pip install flask flask-cors
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 4: Start Application

**Cara 1: Menggunakan Batch Files (Windows)**

1. Double-click `start-backend.bat`
2. Double-click `start-frontend.bat`

**Cara 2: Manual**

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Test Application

1. Buka browser: http://localhost:3000
2. Klik **Chat** di navbar
3. Login dengan nama: `rizky`
4. Buka browser lain (atau incognito)
5. Login dengan nama: `aul`
6. Di window pertama, klik **New Chat**
7. Pilih `aul`, klik **Create Chat**
8. Mulai kirim pesan!

---

## 🧪 Test Encryption

### Test 1: Text Message
1. Ketik pesan: "Hello World"
2. Klik **Send**
3. Pesan akan muncul sebagai "🔒 Encrypted message"
4. Klik **Decrypt**
5. Pesan akan muncul: "Hello World"

### Test 2: File Sharing
1. Klik icon 📎
2. Pilih file (gambar, PDF, dll)
3. Klik **Send**
4. File akan ter-upload terenkripsi
5. Di penerima, klik **Download & Decrypt**
6. File akan ter-download dalam bentuk asli

---

## ✅ Verification Checklist

Pastikan semua ini berjalan:

- [ ] Backend running di http://localhost:5000
- [ ] Frontend running di http://localhost:3000
- [ ] Bisa login dengan nama
- [ ] Bisa create chat room
- [ ] Bisa kirim text message
- [ ] Bisa decrypt message
- [ ] Bisa kirim file
- [ ] Bisa download & decrypt file
- [ ] Real-time: pesan muncul otomatis di penerima

---

## 🐛 Troubleshooting

### Backend tidak start?
```bash
# Install dependencies
pip install flask flask-cors

# Cek port 5000
netstat -ano | findstr :5000

# Jika ada aplikasi lain, kill process atau ganti port
```

### Frontend error?
```bash
# Clear dan reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Decrypt error?
- Pastikan backend running
- Cek browser console (F12)
- Lihat TROUBLESHOOTING.md

---

## 📚 Next Steps

Setelah berhasil:

1. Baca **ARCHITECTURE.md** untuk memahami desain sistem
2. Baca **CHAT_SETUP.md** untuk detail teknis
3. Explore fitur Encrypt/Decrypt/Sign/Verify di homepage

---

## 🎯 Demo Scenario

**Scenario: Secure Document Transfer**

1. **Rizky** login
2. **Aul** login (browser lain)
3. **Rizky** create chat dengan **Aul**
4. **Rizky** kirim file: `confidential.pdf`
5. File ter-encrypt otomatis dengan Room Public Key
6. **Aul** terima notifikasi
7. **Aul** klik "Download & Decrypt"
8. File ter-decrypt dengan Room Private Key
9. **Aul** dapat file asli: `confidential.pdf`

**Security:**
- ✅ File terenkripsi saat transit
- ✅ File terenkripsi saat storage
- ✅ Hanya member room yang bisa decrypt
- ✅ Digital signature memastikan authenticity

---

## 💡 Tips

1. **Multiple Users:** Buka multiple browser/incognito untuk test multi-user
2. **Real-time:** Biarkan kedua window terbuka untuk lihat real-time messaging
3. **Encryption:** Perhatikan bahwa semua pesan ter-encrypt sebelum disimpan
4. **Keys:** Setiap room punya key pair unik yang di-share oleh semua member

---

## 🔗 Useful Links

- Supabase Dashboard: https://eldrxpulpluelgapyfjs.supabase.co
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Test: http://localhost:5000/api/generate-key

---

## 📞 Need Help?

Lihat file dokumentasi:
- `TROUBLESHOOTING.md` - Solusi untuk error umum
- `ARCHITECTURE.md` - Penjelasan desain sistem
- `CHAT_SETUP.md` - Setup detail
- `README.md` - Overview project
