# Rumus Enkripsi RSA, Digital Signature, dan Verify

Dokumen ini menjelaskan rumus yang dipakai pada RSA: cara menentukan public key dan private key, cara enkripsi/dekripsi file, serta cara digital signature dan verification bekerja.

Contoh angka pada dokumen ini sengaja dibuat kecil supaya mudah dihitung manual. Pada aplikasi nyata, RSA memakai angka yang sangat besar, misalnya 2048 bit atau lebih.

## 1. Konsep Dasar RSA

RSA memakai dua jenis kunci:

- Public key: boleh dibagikan ke orang lain. Dipakai untuk enkripsi dan verify signature.
- Private key: harus dirahasiakan. Dipakai untuk dekripsi dan membuat digital signature.

Public key biasanya ditulis:

```text
(n, e)
```

Private key biasanya ditulis:

```text
(n, d)
```

Keterangan:

- `n` adalah modulus.
- `e` adalah eksponen publik.
- `d` adalah eksponen privat.
- `M` adalah pesan asli dalam bentuk angka.
- `C` adalah hasil enkripsi atau ciphertext.
- `S` adalah digital signature.
- `H` adalah hash dari file atau pesan.

## 2. Cara Menentukan Public Key dan Private Key

RSA dimulai dengan memilih dua bilangan prima:

```text
p = 3
q = 11
```

Lalu hitung `n`:

```text
n = p x q
n = 3 x 11
n = 33
```

Setelah itu hitung nilai totient `phi(n)`:

```text
phi(n) = (p - 1) x (q - 1)
phi(n) = (3 - 1) x (11 - 1)
phi(n) = 2 x 10
phi(n) = 20
```

Berikutnya pilih `e`, yaitu eksponen publik.

Syarat `e`:

- `1 < e < phi(n)`
- `e` tidak boleh punya faktor pembagi yang sama dengan `phi(n)` selain `1`
- Dengan kata lain, `gcd(e, phi(n)) = 1`

Misalnya kita pilih:

```text
e = 3
```

Cek:

```text
gcd(3, 20) = 1
```

Berarti `e = 3` valid.

Sekarang tentukan `d`, yaitu eksponen privat.

Syarat `d`:

```text
(d x e) mod phi(n) = 1
```

Karena:

```text
e = 3
phi(n) = 20
```

Kita cari angka `d` yang memenuhi:

```text
(d x 3) mod 20 = 1
```

Coba `d = 7`:

```text
(7 x 3) mod 20 = 21 mod 20 = 1
```

Berarti:

```text
d = 7
```

Maka kuncinya adalah:

```text
Public key  = (n, e) = (33, 3)
Private key = (n, d) = (33, 7)
```

## 3. Rumus Enkripsi RSA

Rumus enkripsi RSA adalah:

```text
C = M^e mod n
```

Artinya:

- Ambil pesan asli `M`.
- Pangkatkan dengan eksponen publik `e`.
- Ambil sisa bagi terhadap `n`.
- Hasilnya adalah ciphertext `C`.

## 4. Studi Kasus Enkripsi Sederhana

Misalnya pesan asli:

```text
M = 7
```

Public key:

```text
(n, e) = (33, 3)
```

Proses enkripsi:

```text
C = M^e mod n
C = 7^3 mod 33
C = 343 mod 33
```

Cari sisa bagi `343` terhadap `33`:

```text
33 x 10 = 330
343 - 330 = 13
```

Jadi:

```text
C = 13
```

Pesan asli `7` setelah dienkripsi menjadi `13`.

## 5. Rumus Dekripsi RSA

Untuk mengembalikan ciphertext ke pesan asli, RSA memakai rumus:

```text
M = C^d mod n
```

Private key:

```text
(n, d) = (33, 7)
```

Ciphertext:

```text
C = 13
```

Proses dekripsi:

```text
M = C^d mod n
M = 13^7 mod 33
M = 62748517 mod 33
M = 7
```

Hasil akhirnya kembali menjadi:

```text
M = 7
```

## 6. Bagaimana Jika yang Dienkripsi Adalah File?

RSA tidak peduli file itu berupa teks, PDF, gambar, audio, video, ZIP, atau format lain. Di komputer, semua file pada akhirnya adalah kumpulan byte.

Contoh:

- File `.txt` berisi huruf.
- File `.jpg` berisi byte gambar.
- File `.pdf` berisi byte dokumen.
- File `.zip` berisi byte arsip.

Semua file bisa dipandang seperti ini:

```text
File asli -> byte -> angka/blok angka -> enkripsi RSA
```

Alurnya:

```text
1. Baca isi file sebagai byte.
2. Pecah byte menjadi blok-blok kecil.
3. Ubah setiap blok menjadi angka M.
4. Pastikan M lebih kecil dari n.
5. Enkripsi setiap M dengan rumus C = M^e mod n.
6. Simpan hasil C sebagai file terenkripsi.
```

Contoh sederhana untuk file teks:

```text
Isi file: "HI"
```

Dalam bentuk byte ASCII:

```text
H = 72
I = 73
```

Jika diproses per karakter, maka:

```text
M1 = 72
M2 = 73
```

Lalu masing-masing dienkripsi:

```text
C1 = 72^e mod n
C2 = 73^e mod n
```

Pada contoh kunci kecil `(n = 33)`, angka `72` dan `73` tidak valid karena harus lebih kecil dari `n`. Karena itu contoh manual sebelumnya memakai `M = 7`.

Pada RSA asli, `n` sangat besar, sehingga blok byte dari file bisa diproses dengan aman.

## 7. Bagaimana Jika File Berupa Gambar?

Gambar juga tetap diproses sebagai byte.

Misalnya file `foto.jpg`:

```text
foto.jpg -> byte gambar -> blok angka -> enkripsi RSA
```

RSA tidak membaca makna gambarnya. RSA hanya melihat angka.

Jadi dari sudut pandang RSA:

```text
Teks   = byte
PDF    = byte
Gambar = byte
Video  = byte
ZIP    = byte
```

Yang berbeda hanya isi byte-nya, bukan rumus RSA-nya.

Rumus tetap:

```text
C = M^e mod n
```

## 8. Catatan Penting tentang RSA untuk File Besar

Secara teori, RSA bisa mengenkripsi blok angka dari file.

Namun pada praktik modern, RSA biasanya tidak dipakai langsung untuk mengenkripsi file besar karena prosesnya berat dan ukuran blok terbatas. Pola yang umum adalah hybrid encryption:

```text
1. File dienkripsi memakai AES.
2. Kunci AES dienkripsi memakai RSA public key.
3. Penerima memakai RSA private key untuk membuka kunci AES.
4. Kunci AES dipakai untuk membuka file.
```

Tetapi jika project ini memang memproses file dengan RSA per chunk, prinsip dasarnya tetap sama:

```text
Setiap chunk file -> angka M -> C = M^e mod n
```

## 9. Digital Signature

Digital signature dipakai untuk membuktikan dua hal:

- File benar berasal dari pemilik private key.
- Isi file tidak berubah sejak ditandatangani.

Digital signature berbeda dari enkripsi.

Perbandingan singkat:

```text
Enkripsi:
Public key  -> mengunci file
Private key -> membuka file

Digital signature:
Private key -> menandatangani file
Public key  -> memverifikasi tanda tangan
```

## 10. Rumus Digital Signature RSA

File biasanya tidak langsung ditandatangani seluruhnya. File terlebih dahulu di-hash.

Hash adalah sidik jari digital dari file.

Misalnya:

```text
File asli -> SHA-256 -> H
```

Lalu hash `H` ditandatangani memakai private key:

```text
S = H^d mod n
```

Keterangan:

- `H` adalah hash file dalam bentuk angka.
- `d` adalah private exponent.
- `n` adalah modulus.
- `S` adalah digital signature.

## 11. Studi Kasus Digital Signature Sederhana

Misalnya hash file disederhanakan menjadi:

```text
H = 7
```

Private key:

```text
(n, d) = (33, 7)
```

Maka signature:

```text
S = H^d mod n
S = 7^7 mod 33
S = 823543 mod 33
S = 28
```

Jadi digital signature-nya:

```text
S = 28
```

Artinya file tersebut punya tanda tangan digital `28`.

## 12. Verify Digital Signature

Verify dipakai untuk mengecek apakah signature cocok dengan file.

Proses verify:

```text
1. Ambil file asli.
2. Hitung hash file lagi.
3. Ambil signature S.
4. Buka signature memakai public key.
5. Bandingkan hash hasil verify dengan hash file yang baru dihitung.
```

Rumus membuka signature:

```text
H_from_signature = S^e mod n
```

Jika:

```text
H_from_signature = H_file_baru
```

Maka signature valid.

Jika tidak sama, berarti:

- File sudah berubah, atau
- Signature bukan dibuat oleh private key yang cocok, atau
- Public key yang dipakai salah.

## 13. Studi Kasus Verify Sederhana

Dari contoh sebelumnya:

```text
Signature S = 28
Public key  = (33, 3)
```

Verify:

```text
H_from_signature = S^e mod n
H_from_signature = 28^3 mod 33
H_from_signature = 21952 mod 33
H_from_signature = 7
```

Lalu sistem menghitung ulang hash file.

Misalnya hasil hash file yang baru dihitung:

```text
H_file_baru = 7
```

Bandingkan:

```text
H_from_signature = 7
H_file_baru      = 7
```

Karena sama, maka:

```text
Signature valid
```

Jika file berubah sedikit saja, hash-nya akan berubah.

Misalnya:

```text
H_file_baru = 9
```

Maka:

```text
H_from_signature = 7
H_file_baru      = 9
```

Karena tidak sama:

```text
Signature invalid
```

## 14. Alur Lengkap pada Project

### Enkripsi File

```text
Input:
- File asli
- Public key

Proses:
1. File dibaca sebagai byte.
2. Byte dipecah menjadi chunk.
3. Setiap chunk diubah menjadi angka M.
4. Setiap M dienkripsi dengan C = M^e mod n.
5. Semua ciphertext digabung menjadi file .encrypted.

Output:
- File terenkripsi
```

### Dekripsi File

```text
Input:
- File .encrypted
- Private key

Proses:
1. File terenkripsi dibaca.
2. Ciphertext dipecah menjadi blok C.
3. Setiap C didekripsi dengan M = C^d mod n.
4. Semua M diubah kembali menjadi byte.
5. Byte disusun ulang menjadi file asli.

Output:
- File asli
```

### Digital Signature

```text
Input:
- File asli
- Private key

Proses:
1. File dibaca sebagai byte.
2. Sistem menghitung hash file, misalnya SHA-256.
3. Hash diubah menjadi angka H.
4. H ditandatangani dengan S = H^d mod n.

Output:
- File signature
```

### Verify Signature

```text
Input:
- File asli
- File signature
- Public key

Proses:
1. File asli dibaca lagi.
2. Sistem menghitung hash baru dari file.
3. Signature dibuka dengan H_from_signature = S^e mod n.
4. Hasilnya dibandingkan dengan hash file baru.

Output:
- Valid jika hash sama.
- Invalid jika hash berbeda.
```

## 15. Ringkasan Rumus

Pembentukan kunci:

```text
n = p x q
phi(n) = (p - 1) x (q - 1)
Pilih e sehingga gcd(e, phi(n)) = 1
Cari d sehingga (d x e) mod phi(n) = 1
Public key  = (n, e)
Private key = (n, d)
```

Enkripsi:

```text
C = M^e mod n
```

Dekripsi:

```text
M = C^d mod n
```

Digital signature:

```text
S = H^d mod n
```

Verify signature:

```text
H_from_signature = S^e mod n
```

Signature valid jika:

```text
H_from_signature = H_file_baru
```
