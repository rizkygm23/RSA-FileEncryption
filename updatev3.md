# CipherVault v3 🔐

## Secure File Communication & Digital Verification Platform

CipherVault v3 is a full-stack cryptography platform that demonstrates how RSA Encryption and Digital Signatures are used in real-world secure communication systems.

Unlike a simple encryption demo, CipherVault v3 simulates realistic scenarios such as:

- Secure company document transfer
- Verification of official documents
- Secure communication between users
- Protection against file tampering
- Proof of file ownership and authenticity

The application is designed as an educational cryptography system that visualizes how modern secure communication protocols work internally using RSA and SHA-256.

---

# 🎯 Main Objective

CipherVault v3 is built to demonstrate how cryptographic systems solve four major security problems in digital communication:

| Security Aspect | Solution |
|---|---|
| Confidentiality | RSA Encryption |
| Authentication | Digital Signature |
| Integrity | SHA-256 Hash Verification |
| Non-Repudiation | RSA Signature Verification |

---

# 🌍 Real-World Problem Simulation

In the digital world, files sent through the internet can face several risks:

- Files can be stolen
- Files can be modified
- Sender identity can be faked
- Senders can deny sending files

CipherVault v3 demonstrates how cryptography solves those problems.

---

# 🧠 System Concept

CipherVault v3 simulates a secure communication protocol between two parties:

```text
Sender ↔ Receiver
```

The system combines:

- RSA Encryption
- Digital Signature
- Hash Verification
- Public Key Cryptography

to create a secure file communication ecosystem.

---

# 👥 Actors in the System

## 1. Sender

The sender:
- encrypts files
- signs documents
- sends encrypted data

Example:
- Company
- University
- Government Institution
- User

---

## 2. Receiver

The receiver:
- decrypts files
- verifies signatures
- validates authenticity

---

# 🔑 RSA Key Structure

## Public Key

```json
{
  "n": 3233,
  "e": 17
}
```

Used for:
- encryption
- signature verification

---

## Private Key

```json
{
  "n": 3233,
  "d": 2753
}
```

Used for:
- decryption
- signing documents

---

# ⚙️ Main Features

## 🔑 1. Generate RSA Key Pair

Generate mathematically linked:

- Public Key
- Private Key

Purpose:
- establish secure communication
- identify system users

---

# 🔒 2. Encrypt Document

## Problem Solved
Prevent unauthorized people from reading sensitive files.

## Example Scenario

A lecturer wants to send exam questions securely to another lecturer.

Without encryption:
- anyone intercepting the file can read it

With CipherVault:
- only the intended receiver can decrypt the file

---

## Encryption Flow

```text
Original File
      ↓
Encrypt using Receiver Public Key
      ↓
Encrypted File
      ↓
Send through Internet
```

---

# 🔓 3. Decrypt Document

## Problem Solved
Allow only authorized users to access encrypted files.

## Example Scenario

The receiver uploads:
- encrypted file
- matching private key

The system restores the original document.

---

## Decryption Flow

```text
Encrypted File
       ↓
Decrypt using Private Key
       ↓
Original File Restored
```

---

# ✍️ 4. Sign Document

## Problem Solved
Prove who created the file.

## Example Scenario

A university issues:
- certificates
- transcripts
- official announcements

The university signs the document digitally so recipients know:
- the document is official
- the sender is authentic

---

## Signing Flow

```text
Document
    ↓
Generate SHA-256 Hash
    ↓
Encrypt Hash using Private Key
    ↓
Digital Signature
```

---

# ✅ 5. Verify Authenticity

## Problem Solved
Detect fake or modified files.

## Example Scenario

Someone receives:
- certificate.pdf
- signature.txt
- university_public_key.txt

The receiver verifies:
- Is this file original?
- Was this file modified?
- Did it really come from the university?

---

## Verification Flow

```text
Document
    ↓
Generate Current Hash
    ↓
Decrypt Signature using Public Key
    ↓
Compare Hashes
    ↓
VALID or INVALID
```

---

# 🔥 Full Secure Communication Workflow

CipherVault v3 demonstrates a complete secure communication protocol.

---

# 📌 Scenario Example

## Step 1 — Key Generation

Alice generates:

- public_key.txt
- private_key.txt

Alice shares ONLY:
```text
public_key.txt
```

---

## Step 2 — Bob Encrypts File

Bob:
- uploads secret.pdf
- uploads Alice's public key
- encrypts the file

Output:
```text
secret.encrypted
```

---

## Step 3 — Bob Signs File

Bob signs the encrypted file using:
```text
Bob's private key
```

Output:
```text
signature.txt
```

Now the receiver knows:
- the file is authentic
- the sender is Bob

---

## Step 4 — Alice Receives File

Alice receives:
- encrypted file
- signature file

---

## Step 5 — Alice Verifies Signature

Alice verifies the signature using:
```text
Bob's public key
```

If VALID:
- file is authentic
- file was not modified

---

## Step 6 — Alice Decrypts File

Alice decrypts the file using:
```text
Alice's private key
```

Original file restored securely.

---

# 🧮 Mathematical Concepts Demonstrated

## RSA Key Generation

:contentReference[oaicite:0]{index=0}

---

## Euler Totient

:contentReference[oaicite:1]{index=1}

---

## RSA Encryption

:contentReference[oaicite:2]{index=2}

---

## RSA Decryption

:contentReference[oaicite:3]{index=3}

---

## Digital Signature

:contentReference[oaicite:4]{index=4}

---

## Signature Verification

:contentReference[oaicite:5]{index=5}

---

# 🏗️ System Architecture

```text
┌────────────────────┐
│     Frontend       │
│      Next.js       │
└─────────┬──────────┘
          │ API Request
          ▼
┌────────────────────┐
│      Backend       │
│       Flask        │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ RSA Cryptography   │
│ SHA256 Hashing     │
└────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- React Dropzone

---

## Backend
- Python
- Flask
- Flask-CORS
- hashlib

---

# 🎓 Educational Value

CipherVault v3 helps students understand:

- RSA Cryptography
- Public Key Infrastructure
- Digital Signature Systems
- Secure Communication Protocols
- Authentication Mechanisms
- Data Integrity Validation
- Non-Repudiation
- Real-world Cryptography Workflows

---

# 🚀 Future Development

Potential future upgrades:

- Multi-user communication
- Database integration
- Certificate Authority simulation
- AES + RSA Hybrid Encryption
- Real-time messaging encryption
- Secure cloud storage
- Blockchain signature verification

---

# 🏆 Conclusion

CipherVault v3 is not just a simple RSA demo.

It is a simulation of a real secure communication ecosystem that demonstrates how cryptography is used to:

- protect confidential files
- verify document authenticity
- secure digital communication
- prevent data tampering
- establish trust between users

The project combines RSA Encryption, SHA-256 Hashing, and Digital Signatures into one educational full-stack cryptography platform.

---

# 👨‍💻 Author

Nama: [Isi Nama Anda]  
Mata Kuliah: Kriptografi  
Project: CipherVault v3 — Secure File Communication & Digital Verification Platform