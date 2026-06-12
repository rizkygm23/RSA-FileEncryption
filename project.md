# 🔐 CipherVault v3 — Platform Komunikasi Aman & Enkripsi File End-to-End (RSA)

Platform kriptografi full-stack modern yang mendemonstrasikan implementasi nyata **kriptografi kunci publik (RSA)** dan **integritas data (SHA-256)** untuk transfer file aman serta komunikasi chat terenkripsi secara *End-to-End (E2EE)*.

---

## 🚀 Gambaran Umum (Overview)

**CipherVault v3** adalah proyek aplikasi web full-stack yang dirancang khusus untuk memecahkan masalah keamanan data klasik dalam komunikasi digital: **Kerahasiaan (Confidentiality)**, **Autentikasi (Authentication)**, **Integritas (Integrity)**, dan **Anti-Penyangkalan (Non-Repudiation)**. 

Proyek ini tidak menggunakan pustaka (*library*) kriptografi siap pakai untuk fungsi RSA-nya. Sebaliknya, **seluruh algoritma RSA dan generasi keypair ditulis dari nol (from scratch)** pada backend berbasis Python, menjadikannya proyek demonstrasi teknis yang sangat bernilai tinggi untuk portofolio developer.

Aplikasi ini memiliki dua pilar utama:
1. **Workspace Enkripsi File**: Dashboard interaktif untuk mengenkripsi, mendekripsi, menandatangani (signing), dan memverifikasi integritas file apapun (gambar, PDF, dokumen text, dll.).
2. **Secure Chat Room**: Platform pesan instan multi-user di mana setiap pesan dan file yang dikirim di dalam room dienkripsi secara *end-to-end* menggunakan pasangan kunci RSA penerima/ruang obrolan, didukung oleh database real-time modern.

---

## 💡 Masalah Dunia Nyata & Solusi Kriptografi

Di era digital, komunikasi dan transfer berkas melalui internet rentan terhadap berbagai risiko keamanan. CipherVault v3 mengatasi risiko tersebut melalui empat prinsip keamanan utama:

| Aspek Keamanan | Risiko Dunia Nyata | Solusi di CipherVault v3 | Algoritma / Metode |
| :--- | :--- | :--- | :--- |
| **Confidentiality** (Kerahasiaan) | Berkas disadap atau dicuri oleh pihak ketiga di jaringan internet. | Berkas dienkripsi sehingga hanya pemilik kunci privat (*private key*) yang cocok yang dapat membaca isinya. | **RSA Encryption** <br> $C = M^e \pmod n$ |
| **Authentication** (Autentikasi) | Pemalsuan identitas pengirim berkas (impersonasi). | Pengirim menandatangani berkas dengan kunci privat miliknya untuk membuktikan identitas aslinya. | **RSA Digital Signature** <br> $S = \text{Hash}^d \pmod n$ |
| **Integrity** (Integritas) | Berkas dimodifikasi secara sengaja atau tidak sengaja saat transit. | Sistem membandingkan nilai hash berkas asli dengan berkas yang diterima untuk mendeteksi perubahan sekecil apa pun. | **SHA-256 Hashing** |
| **Non-Repudiation** (Anti-Penyangkalan) | Pengirim menyangkal telah mengirimkan berkas atau pesan tertentu. | Tanda tangan digital hanya bisa dibuat menggunakan kunci privat pengirim, sehingga pengirim tidak dapat menyangkal berkas tersebut. | **RSA Signature Verification** <br> $\text{Hash} = S^e \pmod n$ |

---

## 🛠️ Stack Teknologi

Aplikasi ini dirancang menggunakan arsitektur modern yang memisahkan backend pemrosesan kriptografi yang berat dengan frontend yang interaktif dan dinamis:

### **Backend (Cryptography Engine)**
*   **Python**: Bahasa pemrograman utama untuk logika bisnis dan perhitungan matematika presisi tinggi.
*   **Flask**: Micro-framework untuk menyediakan RESTful API endpoints yang cepat dan ringan.
*   **Flask-CORS**: Untuk menangani *Cross-Origin Resource Sharing* dengan aman antara frontend dan backend.
*   **Hashlib**: Untuk menghasilkan nilai hash dokumen yang aman menggunakan standar industri SHA-256.

### **Frontend & Database (Interactive UI)**
*   **Next.js 15 (React 19 & App Router)**: Framework produksi modern dengan performa superior dan *routing* berbasis folder.
*   **TypeScript**: Menjamin keamanan tipe (*type safety*) dan meminimalkan bug runtime pada logika frontend.
*   **Tailwind CSS**: Untuk merancang antarmuka pengguna yang bersih, minimalis, dan profesional dengan pendekatan *mobile-first*.
*   **Supabase (PostgreSQL)**: Sebagai backend database cloud untuk menyimpan informasi chat rooms dan pesan terenkripsi secara real-time.
*   **React Dropzone**: Memberikan pengalaman *drag-and-drop* file yang sangat mulus dan modern.

---

## 🧠 Konsep Matematika RSA yang Diimplementasikan

Algoritma RSA dalam proyek ini ditulis secara kustom di file [rsa_utils.py](file:///c:/Users/HP/codingan/RSA-FileEncryption/backend/rsa_utils.py). Berikut adalah tahapan matematis yang dijalankan:

### 1. Pembentukan Pasangan Kunci (Key Generation)
*   Memilih dua bilangan prima besar $p$ dan $q$ (misal: $p=61, q=53$).
*   Menghitung Modulus:
    $$n = p \times q = 61 \times 53 = 3233$$
*   Menghitung Euler's Totient:
    $$\phi(n) = (p-1) \times (q-1) = 60 \times 52 = 3120$$
*   Memilih Eksponen Publik $e$ yang relatif prima terhadap $\phi(n)$ dan memenuhi syarat $\text{gcd}(e, \phi(n)) = 1$ (dipilih $e = 17$).
*   Menghitung Eksponen Privat $d$ menggunakan *Multiplicative Inverse* modular (didapatkan $d = 2753$):
    $$d \times e \equiv 1 \pmod{\phi(n)}$$

### 2. Enkripsi (Encryption)
Pesan $M$ dikonversi menjadi representasi byte. Setiap byte dienkripsi secara independen menggunakan Kunci Publik $(e, n)$:
$$C = M^e \pmod n$$

### 3. Dekripsi (Decryption)
Ciphertext $C$ dikembalikan menjadi byte pesan asli $M$ menggunakan Kunci Privat $(d, n)$:
$$M = C^d \pmod n$$

### 4. Tanda Tangan Digital (Digital Signature)
*   Membuat sidik jari digital berkas dengan SHA-256:
    $$\text{Hash} = \text{SHA-256}(\text{File})$$
*   Mengenkripsi nilai hash tersebut dengan kunci privat pengirim $d$:
    $$S = \text{Hash}^d \pmod n$$

---

## ⚙️ Fitur Utama & Antarmuka Aplikasi

### 1. **Workspace Enkripsi File**
*   **Generate RSA Keys**: Pengguna dapat mengunduh kunci publik dan privat dalam format file `.txt` sederhana berstruktur JSON secara instan.
*   **File Encryption**: Mengunggah berkas apa saja (PDF, JPG, PNG, DOCX) beserta kunci publik penerima, dan mengunduh berkas `.encrypted` yang tidak dapat dibuka tanpa kunci privat yang cocok.
*   **File Decryption**: Mengunggah berkas `.encrypted` beserta kunci privat, mengembalikan berkas ke format aslinya tanpa kerusakan data.
*   **Digital Signing**: Menandatangani dokumen asli dengan kunci privat pengirim untuk menghasilkan file tanda tangan digital kustom (`.signature.txt`).
*   **Signature Verification**: Mengunggah berkas asli, kunci publik pengirim, dan file tanda tangan untuk memvalidasi apakah berkas tersebut asli dan bebas dari modifikasi.

### 2. **Secure Chat Room dengan Supabase**
*   **End-to-End Encrypted Messaging**: Setiap pesan teks yang dikirim dalam obrolan akan dienkripsi di sisi klien sebelum dikirim ke database Supabase. Pesan yang tersimpan di cloud adalah ciphertext mentah.
*   **File Sharing Terenkripsi**: Mengirim gambar atau berkas di ruang obrolan secara aman. Berkas dienkripsi sebelum diunggah ke cloud storage, memastikan admin database sekalipun tidak dapat melihat berkas pengguna.
*   **Multi-User Chat Rooms**: Membuat ruang obrolan tertutup menggunakan kode akses atau kunci pas unik.
*   **Desain UI Minimalis**: UI monokromatis profesional dengan micro-animations, loading skeleton state independen, dan responsivitas penuh.

---

## 📂 Struktur Proyek

```text
RSA-FileEncryption/
├── backend/
│   ├── app.py              # Server Flask REST API & routing endpoint
│   ├── rsa_utils.py        # Implementasi matematika RSA (Key Gen, Encrypt, Decrypt) dari nol
│   ├── signature_utils.py  # Logika pembuatan & verifikasi Digital Signature dengan SHA-256
│   ├── requirements.txt    # Dependensi backend Python
│   ├── uploads/            # Direktori penyimpanan file sementara
│   ├── encrypted/          # Hasil enkripsi berkas backend
│   └── decrypted/          # Hasil dekripsi berkas backend
│
└── frontend/
    ├── src/
    │   ├── app/            # Next.js 15 App Router pages & layouts
    │   │   ├── chat/       # Modul Chat Room terenkripsi End-to-End
    │   │   └── login/      # Halaman otentikasi user obrolan
    │   ├── components/     # React Components reusable
    │   │   ├── chat/       # Komponen visual obrolan (ChatWindow, MessageBubble, ChatSidebar)
    │   │   └── operations/ # Form Workspace (EncryptOp, DecryptOp, SignOp, VerifyOp)
    │   ├── services/       # Integrasi API Axios dengan Backend Flask
    │   └── store/          # Manajemen state frontend (jika ada)
    ├── package.json        # Dependensi frontend Node.js
    └── tsconfig.json       # Konfigurasi TypeScript compiler
```

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

### **Prasyarat**
*   Python 3.8 ke atas
*   Node.js 18 ke atas
*   Akun Supabase (opsional, untuk database chat)

### **1. Konfigurasi Backend**
```bash
# Masuk ke folder backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Jalankan server Flask
python app.py
```
Server backend akan aktif di `http://127.0.0.1:5000`.

### **2. Konfigurasi Frontend**
```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Salin dan isi file environment variables (.env.local) dengan kredensial Supabase Anda
cp .env.local.example .env.local

# Jalankan server Next.js lokal
npm run dev
```
Aplikasi web dapat diakses di `http://localhost:3000`.

---

## 🏆 Kesimpulan & Nilai Jual Portofolio

Proyek **CipherVault v3** ini membuktikan kompetensi mendalam dalam beberapa area rekayasa perangkat lunak modern:
1.  **Pemahaman Teoretis & Praktis Kriptografi**: Mengimplementasikan algoritma asimetris matematika tingkat lanjut (RSA) secara manual tanpa bergantung pada pustaka standar industri seperti `pycryptodome` untuk fungsi inti.
2.  **Keamanan End-to-End Terapan**: Membangun aplikasi chat di mana privasi pengguna dilindungi secara mutlak—data dienkripsi sebelum meninggalkan browser pengguna dan didekripsi langsung di browser penerima menggunakan kunci yang aman.
3.  **Integrasi Fullstack Tingkat Lanjut**: Menghubungkan arsitektur Next.js 15 modern dengan REST API Flask Python secara mulus, menangani unggahan berkas biner besar, dan memproses data biner kustom secara real-time.
4.  **UI/UX Premium & Estetika**: Menghadirkan antarmuka minimalis profesional bebas dari elemen generik (*AI slop*), menampilkan visualisasi proses kriptografi yang informatif serta intuitif bagi pengguna awam.