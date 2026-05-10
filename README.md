# CipherVault v3

Secure file communication and digital verification platform demonstrating RSA encryption and digital signatures.

---

## Overview

CipherVault v3 is an educational cryptography platform that demonstrates how RSA encryption and digital signatures solve real-world security problems in digital communication:

- **Confidentiality** - RSA Encryption ensures only intended recipients can read files
- **Authentication** - Digital Signatures prove document authenticity
- **Integrity** - SHA-256 Hash verification detects tampering
- **Non-Repudiation** - Signature verification prevents sender denial

---

## Features

### 1. Key Generation
Generate mathematically linked RSA public and private key pairs for secure communication.

### 2. File Encryption
Encrypt documents using RSA public key cryptography. Only the holder of the matching private key can decrypt and access the content.

### 3. File Decryption
Decrypt encrypted files using RSA private keys. Restore original documents securely without exposing sensitive data.

### 4. Document Signing
Create digital signatures using SHA-256 hashing and RSA encryption. Prove document authenticity and prevent sender repudiation.

### 5. Signature Verification
Verify digital signatures against public keys. Detect tampering and confirm document integrity using cryptographic validation.

---

## Technology Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- React Dropzone

### Backend
- Python 3
- Flask
- Flask-CORS
- hashlib (SHA-256)

---

## Installation

### Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
pip install flask flask-cors
python app.py
```

The backend server will run on `http://127.0.0.1:5000`

### Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## Usage Workflow

### Complete Secure Communication Example

**Scenario: Bob wants to send a confidential file to Alice**

1. **Alice generates keys** - Creates public/private key pair, shares public key with Bob
2. **Bob encrypts file** - Uses Alice's public key to encrypt the document
3. **Bob signs file** - Creates digital signature using his private key
4. **Alice verifies signature** - Confirms authenticity using Bob's public key
5. **Alice decrypts file** - Restores original document using her private key

### Document Authentication Example

**Scenario: University issues official certificate**

1. **University generates keys** - Creates key pair, publishes public key
2. **University signs certificate** - Creates signature using private key
3. **University distributes** - Sends certificate + signature file
4. **Anyone can verify** - Uses public key to confirm authenticity

---

## Security Principles

| Security Aspect | Implementation | Formula |
|----------------|----------------|---------|
| Confidentiality | RSA Encryption | C = M^e mod n |
| Authentication | Digital Signature | S = Hash^d mod n |
| Integrity | SHA-256 Hash | Hash(File) |
| Non-Repudiation | Signature Verification | Hash = S^e mod n |

---

## Mathematical Concepts

### RSA Key Generation
- Select prime numbers p and q
- Calculate n = p × q
- Calculate φ(n) = (p-1)(q-1)
- Choose public exponent e
- Calculate private exponent d

### RSA Encryption
```
Ciphertext = (Message ^ e) mod n
```

### RSA Decryption
```
Message = (Ciphertext ^ d) mod n
```

### Digital Signature
```
Signature = (Hash ^ d) mod n
```

### Signature Verification
```
Hash = (Signature ^ e) mod n
```

---

## Project Structure

```
RSA-FileEncryption/
├── backend/
│   ├── app.py              # Flask API server
│   ├── rsa_utils.py        # RSA encryption/decryption
│   ├── signature_utils.py  # Digital signature functions
│   ├── requirements.txt
│   ├── encrypted/          # Encrypted files storage
│   ├── decrypted/          # Decrypted files storage
│   ├── signatures/         # Signature files storage
│   └── uploads/            # Temporary uploads
└── frontend/
    ├── src/
    │   ├── app/            # Next.js pages
    │   │   ├── encrypt/
    │   │   ├── decrypt/
    │   │   ├── sign/
    │   │   └── verify/
    │   ├── components/     # React components
    │   └── services/       # API client
    └── package.json
```

---

## API Endpoints

- `POST /generate-key` - Generate RSA key pair
- `POST /encrypt` - Encrypt file with public key
- `POST /decrypt` - Decrypt file with private key
- `POST /sign` - Generate digital signature
- `POST /verify` - Verify digital signature

---

## Educational Value

This project demonstrates:
- RSA public key cryptography implementation
- Digital signature systems
- Hash-based integrity verification
- Secure communication protocols
- Public Key Infrastructure (PKI) concepts
- Real-world cryptography workflows

---

## License

Educational project for cryptography demonstration.

---

**CipherVault v3** - Secure File Communication & Digital Verification Platform
