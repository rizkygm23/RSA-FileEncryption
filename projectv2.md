# 🔐 CipherVault v2 — RSA File Encryption & Digital Signature System

## 📖 Deskripsi Project

CipherVault v2 adalah aplikasi keamanan file berbasis web yang mengimplementasikan algoritma RSA untuk:

- Enkripsi file
- Dekripsi file
- Digital signature
- Verifikasi tanda tangan digital

Project ini dibuat untuk memenuhi tugas mata kuliah Kriptografi dengan fokus pada implementasi:

- RSA Encryption
- Digital Signature
- Public Key Cryptography
- Protokol Kriptografi
- Authentication & Integrity

Aplikasi dikembangkan menggunakan:

- Flask sebagai backend API
- Next.js sebagai frontend
- RSA sebagai algoritma utama

---

# 🎯 Tujuan Project

Project ini bertujuan untuk:

- Mengamankan file menggunakan RSA
- Memahami konsep public key dan private key
- Mengimplementasikan tanda tangan digital
- Memahami autentikasi dan integritas data
- Membuat aplikasi fullstack berbasis kriptografi

---

# 🧠 Konsep RSA

RSA merupakan algoritma asymmetric cryptography yang menggunakan dua buah key:

## Public Key

Digunakan untuk:
- encrypt
- verify signature

Format:

```json
{
  "n": 3233,
  "e": 17
}
```

---

## Private Key

Digunakan untuk:
- decrypt
- sign document

Format:

```json
{
  "n": 3233,
  "d": 2753
}
```

---

# 🔑 Penjelasan Parameter RSA

| Parameter | Fungsi |
|---|---|
| p | bilangan prima pertama |
| q | bilangan prima kedua |
| n | modulus RSA |
| e | public exponent |
| d | private exponent |

---

# ⚙️ Pembentukan RSA Key

## 1. Menentukan Bilangan Prima

```text
p = 61
q = 53
```

---

## 2. Menghitung Modulus

:contentReference[oaicite:0]{index=0}

Contoh:

:contentReference[oaicite:1]{index=1}

---

## 3. Menghitung Euler Totient

:contentReference[oaicite:2]{index=2}

Contoh:

:contentReference[oaicite:3]{index=3}

---

## 4. Menentukan Public Exponent

Dipilih:

```text
e = 17
```

Karena:
- relatif prima terhadap φ(n)
- gcd(e, φ(n)) = 1

---

## 5. Menentukan Private Exponent

Mencari nilai d:

:contentReference[oaicite:4]{index=4}

Hasil:

```text
d = 2753
```

---

# 🔐 Proses Enkripsi RSA

Rumus enkripsi RSA:

:contentReference[oaicite:5]{index=5}

Keterangan:

| Simbol | Arti |
|---|---|
| M | plaintext/message |
| C | ciphertext |
| e | public exponent |
| n | modulus |

---

# ✨ Contoh Enkripsi

Misalkan:

```text
M = 65
e = 17
n = 3233
```

Maka:

:contentReference[oaicite:6]{index=6}

Hasil:

```text
C = 2790
```

Ciphertext yang dikirim adalah:

```text
2790
```

---

# 🔓 Proses Dekripsi RSA

Rumus dekripsi RSA:

:contentReference[oaicite:7]{index=7}

Keterangan:

| Simbol | Arti |
|---|---|
| C | ciphertext |
| M | plaintext |
| d | private exponent |
| n | modulus |

---

# ✨ Contoh Dekripsi

Diketahui:

```text
C = 2790
d = 2753
n = 3233
```

Maka:

:contentReference[oaicite:8]{index=8}

Hasil:

```text
M = 65
```

Pesan berhasil dikembalikan menjadi plaintext asli.

---

# ✍️ Digital Signature RSA

Digital signature digunakan untuk memastikan:

- file asli
- pengirim asli
- file tidak dimodifikasi

---

# 🔄 Proses Digital Signature

## Sign File

```text
File
 ↓
Generate Hash SHA256
 ↓
Encrypt Hash menggunakan Private Key
 ↓
Digital Signature
```

---

## Verify Signature

```text
File
 ↓
Generate Hash Baru
 ↓
Decrypt Signature menggunakan Public Key
 ↓
Bandingkan Hash
```

Jika hash sama:

```text
Signature Valid
```

---

# 🔒 Aspek Keamanan

| Aspek | Fungsi |
|---|---|
| Confidentiality | File terenkripsi |
| Authentication | Verifikasi pengirim |
| Integrity | Memastikan file tidak berubah |
| Non-repudiation | Pengirim tidak dapat menyangkal |

---

# ⚙️ Fitur Utama

## ✅ Generate RSA Key

Sistem menghasilkan:

- public_key.txt
- private_key.txt

---

## ✅ Encrypt File

User dapat:

- upload file
- upload public key
- mengenkripsi file

Output:

```text
file.encrypted
```

---

## ✅ Decrypt File

User dapat:

- upload encrypted file
- upload private key
- mendekripsi file

---

## ✅ Generate Digital Signature

Output:

```text
signature.txt
```

---

## ✅ Verify Signature

Sistem memverifikasi:

- apakah file asli
- apakah signature valid

---

# 🛠️ Teknologi yang Digunakan

# Backend

| Teknologi | Fungsi |
|---|---|
| Python | Bahasa backend |
| Flask | REST API |
| Flask-CORS | Integrasi frontend |
| hashlib | Generate SHA256 hash |

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

# Backend

```text
backend/
│
├── app.py
├── rsa_utils.py
├── signature_utils.py
├── requirements.txt
│
├── uploads/
├── encrypted/
├── decrypted/
├── signatures/
└── keys/
```

---

# Frontend

```text
frontend/
│
├── app/
│   ├── encrypt/
│   ├── decrypt/
│   ├── sign/
│   ├── verify/
│   └── page.tsx
│
├── components/
│   ├── UploadBox.tsx
│   ├── Navbar.tsx
│   └── ResultCard.tsx
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

## Sign File

```http
POST /sign
```

---

## Verify Signature

```http
POST /verify
```

---

# ⚠️ Keterbatasan RSA

Karena RSA memiliki batas ukuran data:

- proses encrypt file besar lebih lambat
- file diproses per byte/chunk

Project ini difokuskan untuk:
- pembelajaran RSA
- implementasi digital signature
- simulasi protokol kriptografi

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

# 🏆 Kesimpulan

CipherVault v2 merupakan aplikasi fullstack berbasis Flask dan Next.js yang mengimplementasikan algoritma RSA untuk:

- file encryption
- digital signature
- signature verification

Project ini membantu memahami:

- RSA Encryption
- Digital Signature
- Public Key Cryptography
- Authentication
- Integrity
- Non-repudiation
- REST API Integration

Selain itu, project ini sesuai dengan materi protokol kriptografi dan tanda tangan digital pada mata kuliah Kriptografi.

---

# 👨‍💻 Author

Nama: [Isi Nama Anda]  
Mata Kuliah: Kriptografi  
Project: CipherVault v2 — RSA File Encryption & Digital Signature System