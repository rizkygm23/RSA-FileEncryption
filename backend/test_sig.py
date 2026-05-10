import hashlib
from rsa_utils import generate_keypair, encrypt, decrypt
from signature_utils import sign_file, verify_signature

def test():
    public, private = generate_keypair(61, 53)
    
    file_bytes = b"Hello world! This is a test file for RSA signature."
    
    # Sign
    signature = sign_file(private, file_bytes)
    
    # Verify
    is_valid = verify_signature(public, file_bytes, signature)
    print(f"Is signature valid? {is_valid}")
    
    # Try modifying
    is_valid_modified = verify_signature(public, file_bytes + b"a", signature)
    print(f"Is signature valid (modified)? {is_valid_modified}")

if __name__ == '__main__':
    test()
