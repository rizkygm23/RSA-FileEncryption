# CipherVault v3 - Architecture & Encryption Design

## Key Management Architecture

### ❌ Pendekatan Lama (Per-User Keys)
```
User A: Public Key A, Private Key A
User B: Public Key B, Private Key B

Masalah:
- Harus encrypt message 2x (untuk A dan B)
- Tidak efisien untuk group chat
- Kompleksitas meningkat dengan jumlah user
```

### ✅ Pendekatan Baru (Per-Room Keys)
```
Room 1: Public Key R1, Private Key R1
  ├── Member: User A
  └── Member: User B

Keuntungan:
- Encrypt message 1x saja (dengan Room Key)
- Semua member bisa decrypt dengan Room Private Key yang sama
- Efisien untuk group chat
- Scalable untuk banyak user
```

## Database Schema

### users_kriptografi
```sql
- id (UUID)
- username (TEXT) - unique identifier
- display_name (TEXT) - nama tampilan
- created_at (TIMESTAMP)
- last_seen (TIMESTAMP)

❌ TIDAK ADA: public_key, private_key
```

### chat_rooms_kriptografi
```sql
- id (UUID)
- room_name (TEXT) - optional
- public_key (TEXT) ✅ - untuk encrypt message
- private_key (TEXT) ✅ - untuk decrypt message
- created_by (UUID)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### room_members_kriptografi
```sql
- id (UUID)
- room_id (UUID) - foreign key ke chat_rooms
- user_id (UUID) - foreign key ke users
- joined_at (TIMESTAMP)
```

### messages_kriptografi
```sql
- id (UUID)
- room_id (UUID)
- sender_id (UUID)
- message_type (TEXT) - 'text' atau 'file'
- encrypted_content (TEXT) - encrypted dengan room public key
- signature (TEXT) - signed dengan room private key
- file_name (TEXT) - optional
- file_size (BIGINT) - optional
- file_url (TEXT) - optional
- created_at (TIMESTAMP)
```

## Encryption Flow

### 1. Create Room
```
User A membuat chat dengan User B
    ↓
Generate RSA Key Pair untuk Room
    ↓
Room: { public_key, private_key }
    ↓
Add members: [User A, User B]
    ↓
Semua member dapat akses ke Room Keys
```

### 2. Send Message
```
User A ketik: "Hello World"
    ↓
Encrypt dengan Room Public Key
    ↓
Sign dengan Room Private Key
    ↓
Save: { encrypted_content, signature }
    ↓
Broadcast ke semua room members
```

### 3. Receive & Decrypt Message
```
User B menerima encrypted message
    ↓
Klik "Decrypt"
    ↓
Decrypt dengan Room Private Key
    ↓
Verify signature dengan Room Public Key
    ↓
Tampilkan plaintext: "Hello World"
```

## Security Model

### Shared Secret (Room Keys)
- Setiap room punya key pair unik
- Semua member room share key yang sama
- Member baru dapat akses ke room keys saat join
- Member yang keluar tidak bisa decrypt message baru (jika key di-rotate)

### Encryption
```
Plaintext → RSA Encrypt (Room Public Key) → Ciphertext
```

### Decryption
```
Ciphertext → RSA Decrypt (Room Private Key) → Plaintext
```

### Digital Signature
```
Message → SHA-256 Hash → RSA Sign (Room Private Key) → Signature
```

### Signature Verification
```
Signature → RSA Verify (Room Public Key) → Hash
Compare Hash dengan SHA-256(Message) → Valid/Invalid
```

## Advantages

### ✅ Efficiency
- Encrypt sekali untuk semua member
- Tidak perlu encrypt per-recipient
- Hemat bandwidth dan processing

### ✅ Scalability
- Group chat dengan 10 user = 1x encryption
- Tidak ada perbedaan kompleksitas antara 2 user vs 100 user

### ✅ Simplicity
- Satu key pair per room
- Mudah di-manage
- Clear ownership (room owns keys)

### ✅ Group Chat Ready
- Designed untuk group messaging
- Semua member equal access
- No special handling untuk multiple recipients

## Security Considerations

### ⚠️ Key Distribution
**Current Implementation:**
- Room keys disimpan di database
- Semua member dapat akses

**Production Recommendation:**
- Encrypt room private key dengan member passwords
- Store encrypted keys per-member
- Use key derivation function (KDF)

### ⚠️ Forward Secrecy
**Current Implementation:**
- Room keys static (tidak berubah)
- Member lama bisa decrypt message lama

**Production Recommendation:**
- Implement key rotation
- Generate new keys periodically
- Use ratcheting mechanism (Signal Protocol)

### ⚠️ Member Removal
**Current Implementation:**
- Member yang di-remove masih punya akses ke old keys

**Production Recommendation:**
- Rotate keys saat member removed
- Re-encrypt dengan key baru
- Revoke access ke old messages

## Comparison: Per-User vs Per-Room Keys

| Aspect | Per-User Keys | Per-Room Keys |
|--------|---------------|---------------|
| Encryption Count | N-1 (untuk N users) | 1 |
| Key Management | Complex | Simple |
| Group Chat | Inefficient | Efficient |
| Scalability | Poor | Excellent |
| Storage | High | Low |
| Processing | High | Low |

## Implementation Details

### Room Creation
```typescript
// Generate keys untuk room
const keys = await generateKey();

// Create room dengan keys
const room = await supabase
  .from('chat_rooms_kriptografi')
  .insert({
    public_key: keys.public_key,
    private_key: keys.private_key,
  });
```

### Send Message
```typescript
// Encrypt dengan room public key
const encrypted = await encryptFile(message, room.public_key);

// Sign dengan room private key
const signature = await signFile(message, room.private_key);

// Save
await supabase.from('messages_kriptografi').insert({
  encrypted_content: encrypted,
  signature: signature,
});
```

### Decrypt Message
```typescript
// Decrypt dengan room private key
const decrypted = await decryptFile(
  encrypted_message, 
  room.private_key
);

// Verify signature dengan room public key
const isValid = await verifySignature(
  decrypted,
  room.public_key,
  signature
);
```

## Future Enhancements

1. **Key Rotation**
   - Automatic key rotation setiap X hari
   - Manual rotation saat member removed

2. **Perfect Forward Secrecy**
   - Implement Double Ratchet Algorithm
   - Ephemeral keys per message

3. **End-to-End Encryption (True E2E)**
   - Keys never touch server
   - Client-side key generation
   - Encrypted key exchange

4. **Multi-Device Support**
   - Sync keys across devices
   - Device-specific encryption

5. **Audit Log**
   - Track key access
   - Monitor encryption/decryption events
   - Detect suspicious activity

## Conclusion

Pendekatan **Per-Room Keys** lebih cocok untuk aplikasi chat karena:
- Lebih efisien untuk group messaging
- Lebih mudah di-implement dan maintain
- Scalable untuk banyak user
- Sesuai dengan use case chat application

Ini adalah **shared secret model** yang umum digunakan di aplikasi chat modern, dengan tambahan digital signature untuk authenticity.
