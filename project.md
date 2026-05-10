# 🔐 CipherVault — RSA File Encryption Tool

## 📖 Deskripsi Project

CipherVault adalah aplikasi web berbasis kriptografi yang digunakan untuk mengenkripsi dan mendekripsi file menggunakan algoritma RSA.

Project ini dibuat untuk memenuhi tugas mata kuliah Kriptografi dengan tujuan memahami implementasi:

- RSA Encryption
- Public Key Cryptography
- File Encryption System
- Fullstack Web Development

Aplikasi dibangun menggunakan:

- Flask sebagai backend API
- Next.js sebagai frontend
- RSA sebagai algoritma enkripsi utama

---

# 🎯 Tujuan Project

Tujuan utama project ini adalah:

- Mengamankan file menggunakan algoritma RSA
- Memahami konsep public key dan private key
- Mempelajari implementasi RSA dalam aplikasi nyata
- Membuat aplikasi fullstack berbasis web

---

# 🧠 Konsep Kriptografi

## RSA (Asymmetric Encryption)

RSA adalah algoritma kriptografi asimetris yang menggunakan dua buah key:

- Public Key → digunakan untuk encrypt
- Private Key → digunakan untuk decrypt

---

# 🔑 Struktur Key RSA

Project ini menggunakan format key sederhana berbasis text.

## Public Key

```text
n = 3233
e = 17
```

Keterangan:

- `n` = modulus
- `e` = public exponent

---

## Private Key

```text
n = 3233
d = 2753
```

Keterangan:

- `n` = modulus
- `d` = private exponent

---

# ⚙️ Cara Kerja RSA

## Encrypt

```text
Cipher = (Message ^ e) mod n
```

## Decrypt

```text
Message = (Cipher ^ d) mod n
```

---

# 🔄 Alur Sistem

## Encrypt Process

```text
Upload File
     ↓
Read File
     ↓
Convert ke Byte
     ↓
Encrypt menggunakan Public Key
     ↓
Save Encrypted File
```

---

## Decrypt Process

```text
Upload Encrypted File
        ↓
Read Encrypted Data
        ↓
Decrypt menggunakan Private Key
        ↓
Restore Original File
```

---

# ⚙️ Fitur Utama

## ✅ Generate RSA Key

Sistem dapat menghasilkan:

- public_key.txt
- private_key.txt

---

## ✅ Encrypt File

User dapat:

- upload file
- upload public key
- mengenkripsi file menggunakan RSA

Output:

```text
file.encrypted
```

---

## ✅ Decrypt File

User dapat:

- upload encrypted file
- upload private key
- mengembalikan file asli

---

## ✅ Download File

Hasil encrypt dan decrypt dapat diunduh.

---

## ✅ Drag & Drop Upload

Frontend modern menggunakan Next.js.

---

# 🛠️ Teknologi yang Digunakan

# Backend

| Teknologi | Fungsi |
|---|---|
| Python | Bahasa backend |
| Flask | REST API |
| Flask-CORS | Menghubungkan frontend dan backend |

---

# Frontend

| Teknologi | Fungsi |
|---|---|
| Next.js | Frontend framework |
| React | UI |
| Axios | HTTP request |
| Tailwind CSS | Styling |

---

# 📚 Persiapan Project

# Install Backend Dependencies

```bash
pip install flask
pip install flask-cors
```

---

# Install Frontend Dependencies

```bash
npx create-next-app@latest frontend
```

---

# Install Additional Packages

```bash
npm install axios
npm install react-dropzone
```

---

# 📂 Struktur Folder Project

## Backend

```text
backend/
│
├── app.py
├── rsa_utils.py
├── requirements.txt
│
├── uploads/
├── encrypted/
├── decrypted/
└── keys/
```

---

## Frontend

```text
frontend/
│
├── app/
│   ├── encrypt/
│   ├── decrypt/
│   └── page.tsx
│
├── components/
│   ├── UploadBox.tsx
│   └── Navbar.tsx
│
├── services/
│   └── api.ts
│
└── public/
```

---

# 🌐 API Endpoint

## Generate RSA Key

```http
GET /generate-key
```

---

## Encrypt File

```http
POST /encrypt
```

---

## Decrypt File

```http
POST /decrypt
```

---

# 🎨 Tampilan Sistem

## Encrypt Page

```text
--------------------------------
|      CipherVault Encrypt     |
--------------------------------

[ Drag & Drop File Here ]

[ Upload Public Key ]

[ Encrypt File ]

--------------------------------
```

---

## Decrypt Page

```text
--------------------------------
|      CipherVault Decrypt     |
--------------------------------

[ Upload Encrypted File ]

[ Upload Private Key ]

[ Decrypt File ]

--------------------------------
```

---

# 🔒 Keamanan Sistem

## Confidentiality

File hanya dapat dibuka menggunakan private key.

---

## Public Key Cryptography

Encrypt dan decrypt menggunakan key berbeda.

---

# ⚠️ Keterbatasan RSA

Karena RSA memiliki batas ukuran data:

- proses encrypt file besar lebih lambat
- file diproses per byte/chunk

Project ini difokuskan untuk:
- pembelajaran RSA
- simulasi file encryption
- implementasi konsep kriptografi

---

# 🚀 Cara Menjalankan Project

# 1. Jalankan Backend

```bash
cd backend
python app.py
```

Backend berjalan di:

```text
http://127.0.0.1:5000
```

---

# 2. Jalankan Frontend

```bash
cd frontend
npm run dev
```

Frontend berjalan di:

```text
http://localhost:3000
```

---

# 📈 Pengembangan Selanjutnya

Fitur tambahan yang dapat dikembangkan:

- Login Authentication
- SHA-256 Integrity Check
- Progress Bar Encryption
- Multiple User Encryption
- Database Integration
- Cloud Storage

---

# 🏆 Kesimpulan

CipherVault merupakan aplikasi fullstack berbasis Flask dan Next.js yang mengimplementasikan algoritma RSA untuk mengenkripsi file pengguna.

Project ini membantu memahami:

- RSA Encryption
- Public Key & Private Key
- REST API
- Frontend & Backend Integration
- File Security System

Selain itu, project ini dapat menjadi dasar pengembangan aplikasi keamanan file yang lebih kompleks.

---

# 👨‍💻 Author

Nama: [Isi Nama Anda]  
Mata Kuliah: Kriptografi  
Project: CipherVault — RSA File Encryption Tool