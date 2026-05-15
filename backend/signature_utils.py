import hashlib
from rsa_utils import encrypt, decrypt


def _hash_file(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()


def sign_file(kunci_privat: tuple[int, int], file_bytes: bytes) -> list[int]:
    hash_file = _hash_file(file_bytes).encode('utf-8')
    return encrypt(kunci_privat, hash_file)


def verify_signature(
    kunci_publik: tuple[int, int],
    file_bytes: bytes,
    data_signature: list[int],
) -> bool:
    try:
        hash_dari_signature = decrypt(kunci_publik, data_signature).decode('utf-8')
    except (UnicodeDecodeError, ValueError):
        return False

    return _hash_file(file_bytes) == hash_dari_signature
