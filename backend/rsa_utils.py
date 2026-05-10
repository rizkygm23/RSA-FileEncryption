import random

def gcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a

def multiplicative_inverse(e, phi):
    d = 0
    x1, x2, x3 = 1, 0, phi
    y1, y2, y3 = 0, 1, e
    while y3 != 0:
        q = x3 // y3
        y1, y2, y3, x1, x2, x3 = (x1 - q * y1), (x2 - q * y2), (x3 - q * y3), y1, y2, y3
    if x3 == 1:
        return x2 % phi

def is_prime(num):
    if num == 2: return True
    if num < 2 or num % 2 == 0: return False
    for n in range(3, int(num**0.5)+2, 2):
        if num % n == 0:
            return False
    return True

def generate_keypair(p, q):
    if not (is_prime(p) and is_prime(q)):
        raise ValueError('Both numbers must be prime.')
    elif p == q:
        raise ValueError('p and q cannot be equal')
    n = p * q
    phi = (p-1) * (q-1)
    
    # In order to use the exact keys from the project description (n=3233, e=17)
    if n == 3233:
        e = 17
    else:
        e = random.randrange(1, phi)
        g = gcd(e, phi)
        while g != 1:
            e = random.randrange(1, phi)
            g = gcd(e, phi)
            
    d = multiplicative_inverse(e, phi)
    return ((e, n), (d, n))

def encrypt(pk, plaintext_bytes):
    key, n = pk
    # Encrypt each byte
    cipher = [pow(char, key, n) for char in plaintext_bytes]
    return cipher

def decrypt(pk, ciphertext):
    key, n = pk
    # Decrypt each integer back to byte
    plain = [pow(char, key, n) for char in ciphertext]
    return bytes(plain)
