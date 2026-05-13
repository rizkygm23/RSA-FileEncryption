# Rumus Enkripsi RSA

Dokumen ini menjelaskan rumus yang dipakai untuk enkripsi RSA dengan studi kasus sederhana. Angka pada contoh sengaja dibuat kecil supaya mudah dihitung manual. Pada aplikasi nyata, RSA memakai angka yang sangat besar, misalnya 2048 bit.

## 1. Konsep Dasar

RSA memakai dua jenis kunci:

- Public key: dipakai untuk enkripsi.
- Private key: dipakai untuk dekripsi.

Public key biasanya ditulis:

```text
(n, e)
```

Private key biasanya ditulis:

```text
(n, d)
```

Keterangan:

- `n` adalah modulus, hasil perkalian dua bilangan prima `p` dan `q`.
- `e` adalah eksponen publik.
- `d` adalah eksponen privat.
- `M` adalah pesan asli dalam bentuk angka.
- `C` adalah hasil enkripsi atau ciphertext.

## 2. Rumus Enkripsi

Rumus enkripsi RSA adalah:

```text
C = M^e mod n
```

Artinya:

- Ambil pesan asli `M`.
- Pangkatkan dengan eksponen publik `e`.
- Ambil sisa bagi terhadap `n`.
- Hasilnya adalah ciphertext `C`.

## 3. Studi Kasus Sederhana

Misalnya kita punya pesan:

```text
M = 7
```

Kita gunakan public key:

```text
n = 33
e = 3
```

Maka proses enkripsinya:

```text
C = M^e mod n
C = 7^3 mod 33
C = 343 mod 33
```

Sekarang cari sisa bagi `343` terhadap `33`.

```text
33 x 10 = 330
343 - 330 = 13
```

Jadi:

```text
C = 13
```

Pesan asli `7` setelah dienkripsi menjadi `13`.

## 4. Kenapa Hasilnya Tidak Sama dengan Pesan Asli?

Karena RSA mengubah pesan asli menggunakan operasi pangkat dan modulo. Orang yang hanya melihat hasil `13` tidak bisa langsung tahu bahwa pesan aslinya adalah `7`, kecuali dia punya private key yang cocok.

## 5. Gambaran Dekripsi

Untuk mengembalikan ciphertext ke pesan asli, RSA memakai rumus:

```text
M = C^d mod n
```

Misalnya private key punya:

```text
n = 33
d = 7
```

Karena ciphertext hasil enkripsi tadi adalah:

```text
C = 13
```

Maka dekripsinya:

```text
M = 13^7 mod 33
M = 62748517 mod 33
M = 7
```

Hasil akhirnya kembali menjadi:

```text
M = 7
```

## 6. Analogi Mudah

Bayangkan public key seperti gembok yang bisa diberikan ke siapa saja.

- Siapa pun boleh memakai public key untuk mengunci pesan.
- Setelah terkunci, pesan hanya bisa dibuka dengan private key.
- Private key harus disimpan oleh pemiliknya dan tidak boleh dibagikan.

Dalam contoh di atas:

```text
Pesan asli      : 7
Public key      : (33, 3)
Rumus enkripsi  : C = 7^3 mod 33
Ciphertext      : 13
Private key     : (33, 7)
Rumus dekripsi  : M = 13^7 mod 33
Pesan kembali   : 7
```

## 7. Catatan untuk File Asli

File komputer tidak langsung dienkripsi sebagai teks biasa. Isi file akan dibaca sebagai byte atau angka, lalu diproses menjadi blok-blok data. Setiap blok data dienkripsi memakai prinsip yang sama:

```text
C = M^e mod n
```

Bedanya, pada aplikasi nyata:

- Angka `M`, `e`, `d`, dan `n` jauh lebih besar.
- File biasanya diproses per bagian atau chunk.
- Sistem juga perlu memastikan ukuran blok tidak lebih besar dari `n`.

Inti rumusnya tetap sama: pesan angka `M` diubah menjadi ciphertext `C` menggunakan public key `(n, e)`.
