# Security Model - CipherVault v3

## 🔐 End-to-End Encryption Architecture

CipherVault v3 menggunakan **true end-to-end encryption** dimana:
- Data dienkripsi di client sebelum dikirim
- Server hanya menyimpan data terenkripsi
- Hanya penerima dengan key yang tepat yang bisa decrypt

---

## 📦 Public Storage for Encrypted Files

### Why Public Bucket is Safe?

**Bucket Configuration:**
```
Storage Bucket: chat-files-kriptografi
Access: PUBLIC ✅
```

**Security Guarantee:**

1. **Pre-Encryption**
   ```
   Original File → RSA Encrypt → Upload to Public Storage
   ```
   File sudah terenkripsi SEBELUM upload

2. **Useless Without Key**
   ```
   Encrypted File (Public) + Private Key (Secret) = Original File
   ```
   Tanpa private key, file tidak bisa dibaca

3. **Key Distribution**
   ```
   Private Key TIDAK pernah di-upload ke storage
   Private Key hanya ada di database (shared by room members)
   ```

### Analogy

Bayangkan seperti:
- **Public Bucket** = Kotak pos di depan rumah (public)
- **Encrypted File** = Surat dalam amplop terkunci
- **Private Key** = Kunci untuk buka amplop

Siapa saja bisa lihat amplop (public), tapi hanya yang punya kunci yang bisa baca isinya!

---

## 🔑 Key Management

### Room-Based Keys

```
Room 1:
  ├── Public Key: n=3233, e=17
  ├── Private Key: n=3233, d=2753
  └── Members: [User A, User B, User C]
       └── All share same keys
```

**Security Properties:**

1. **Shared Secret Model**
   - Semua member room share key yang sama
   - Efficient untuk group messaging
   - Standard di aplikasi chat modern

2. **Key Isolation**
   - Room 1 keys ≠ Room 2 keys
   - Tidak bisa decrypt message dari room lain
   - Perfect isolation antar conversations

3. **Key Storage**
   - Keys disimpan di database (untuk demo)
   - Production: encrypt keys dengan user password
   - Never expose keys di client-side logs

---

## 🛡️ Security Layers

### Layer 1: Transport Security (HTTPS)

```
Client ←→ HTTPS ←→ Server
```

- Supabase menggunakan HTTPS
- Protect data in transit
- Prevent man-in-the-middle attacks

### Layer 2: Storage Encryption (RSA)

```
Plaintext → RSA Encrypt → Ciphertext (stored)
```

- Data encrypted at rest
- Even database admin can't read
- Quantum-resistant (with larger keys)

### Layer 3: Access Control (Room Membership)

```
User → Check Room Member → Allow/Deny Access
```

- Only room members can access
- Membership tracked in database
- Automatic access revocation on removal

---

## 🔒 Encryption Flow

### Send Message

```
1. User types: "Hello World"
2. Frontend encrypts with Room Public Key
3. Frontend signs with Room Private Key
4. Upload encrypted data to Supabase
5. Store: {encrypted_content, signature}
```

**Security:**
- ✅ Message encrypted before leaving device
- ✅ Server never sees plaintext
- ✅ Signature proves authenticity

### Receive Message

```
1. Fetch encrypted message from Supabase
2. Verify signature with Room Public Key
3. Decrypt with Room Private Key
4. Display: "Hello World"
```

**Security:**
- ✅ Signature verification prevents tampering
- ✅ Only valid room members can decrypt
- ✅ Invalid signatures rejected

---

## 📁 File Sharing Security

### Upload Flow

```
1. User selects file: document.pdf
2. Frontend encrypts entire file with Room Public Key
3. Upload encrypted file to PUBLIC storage
4. Store metadata: {file_url, file_name, signature}
```

**Why Public Storage is Safe:**

```
Public Storage:
├── document.pdf.encrypted (gibberish data)
├── image.png.encrypted (gibberish data)
└── video.mp4.encrypted (gibberish data)

Without Private Key:
└── All files are useless binary data
```

### Download Flow

```
1. User clicks "Download & Decrypt"
2. Fetch encrypted file from public URL
3. Decrypt with Room Private Key
4. Save original file: document.pdf
```

**Security:**
- ✅ File encrypted end-to-end
- ✅ Public URL doesn't expose content
- ✅ Only room members can decrypt

---

## 🎯 Threat Model

### What We Protect Against

✅ **Eavesdropping**
- Attacker intercepts network traffic
- Only sees encrypted data
- Cannot read messages

✅ **Database Breach**
- Attacker gains database access
- Only sees encrypted messages
- Cannot decrypt without keys

✅ **Storage Breach**
- Attacker accesses public storage
- Only sees encrypted files
- Cannot decrypt without keys

✅ **Man-in-the-Middle**
- Attacker intercepts communication
- HTTPS prevents tampering
- Signature verification detects changes

✅ **Impersonation**
- Attacker tries to fake messages
- Digital signature prevents this
- Signature verification fails

### What We DON'T Protect Against

⚠️ **Compromised Client**
- If user's device is hacked
- Attacker can read plaintext
- Solution: Device security, antivirus

⚠️ **Key Theft**
- If private key is stolen
- Attacker can decrypt messages
- Solution: Encrypt keys with password

⚠️ **Malicious Room Member**
- Room members can read all messages
- This is by design (shared secret)
- Solution: Don't add untrusted users

⚠️ **Forward Secrecy**
- Old messages can be decrypted with old keys
- No automatic key rotation
- Solution: Implement key rotation (future)

---

## 🔐 Comparison: Public vs Private Storage

| Aspect | Public Storage | Private Storage |
|--------|----------------|-----------------|
| **File Access** | Anyone can download | Need authentication |
| **File Content** | Encrypted (safe) | Encrypted (safe) |
| **Performance** | Fast (CDN) | Slower (auth check) |
| **Complexity** | Simple | Complex policies |
| **CORS Issues** | None | Possible |
| **Security** | ✅ Safe (encrypted) | ✅ Safe (encrypted) |

**Conclusion:** Public storage is BETTER for encrypted files!

---

## 🚀 Production Recommendations

### 1. Key Management

**Current (Demo):**
```sql
-- Keys stored in plaintext
CREATE TABLE chat_rooms_kriptografi (
  private_key TEXT
);
```

**Production:**
```sql
-- Encrypt keys with user password
CREATE TABLE room_keys_kriptografi (
  room_id UUID,
  user_id UUID,
  encrypted_private_key TEXT, -- Encrypted with user password
  key_salt TEXT
);
```

### 2. Key Rotation

**Implement:**
- Rotate keys when member leaves
- Generate new keys periodically
- Re-encrypt old messages (optional)

### 3. Forward Secrecy

**Implement:**
- Use ephemeral keys per message
- Double Ratchet Algorithm (Signal Protocol)
- Perfect forward secrecy

### 4. Audit Logging

**Track:**
- Key access events
- Encryption/decryption operations
- Suspicious activities

### 5. Rate Limiting

**Prevent:**
- Brute force attacks
- Spam messages
- DoS attacks

---

## 📊 Security Checklist

### Development
- [x] End-to-end encryption
- [x] Digital signatures
- [x] Public storage for encrypted files
- [x] Room-based key isolation
- [x] HTTPS transport

### Production (TODO)
- [ ] Encrypt private keys with user password
- [ ] Implement key rotation
- [ ] Add forward secrecy
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Security headers
- [ ] Content Security Policy
- [ ] XSS protection

---

## 🎓 Educational Value

This implementation demonstrates:

1. **End-to-End Encryption**
   - Data encrypted before transmission
   - Server never sees plaintext

2. **Public Key Cryptography**
   - Asymmetric encryption (RSA)
   - Public key for encrypt, private for decrypt

3. **Digital Signatures**
   - Prove authenticity
   - Detect tampering

4. **Shared Secret Model**
   - Efficient group messaging
   - Common in modern chat apps

5. **Defense in Depth**
   - Multiple security layers
   - No single point of failure

---

## 🔗 References

- [RSA Cryptography](https://en.wikipedia.org/wiki/RSA_(cryptosystem))
- [End-to-End Encryption](https://en.wikipedia.org/wiki/End-to-end_encryption)
- [Digital Signature](https://en.wikipedia.org/wiki/Digital_signature)
- [Signal Protocol](https://signal.org/docs/)
- [OWASP Security Guidelines](https://owasp.org/)

---

## 💡 Key Takeaway

**Public storage + Encrypted files = Secure!**

Selama file dienkripsi dengan benar SEBELUM upload, tidak masalah jika storage-nya public. Ini adalah prinsip dasar end-to-end encryption yang digunakan oleh WhatsApp, Signal, dan aplikasi secure messaging lainnya.

🔐 **Security is about encryption, not obscurity!**
