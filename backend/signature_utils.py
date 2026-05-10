import hashlib
from rsa_utils import encrypt, decrypt

def sign_file(private_key, file_bytes):
    # Generate SHA256 Hash
    hasher = hashlib.sha256()
    hasher.update(file_bytes)
    file_hash = hasher.hexdigest().encode('utf-8')
    
    # Encrypt hash with Private Key (signing)
    signature_data = encrypt(private_key, file_hash)
    return signature_data

def verify_signature(public_key, file_bytes, signature_data):
    # Generate new hash
    hasher = hashlib.sha256()
    hasher.update(file_bytes)
    new_hash = hasher.hexdigest()
    
    # Decrypt signature with Public Key
    try:
        decrypted_hash_bytes = decrypt(public_key, signature_data)
        decrypted_hash = decrypted_hash_bytes.decode('utf-8')
        return new_hash == decrypted_hash
    except Exception as e:
        return False
