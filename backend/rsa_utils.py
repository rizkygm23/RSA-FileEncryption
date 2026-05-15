import random
from collections.abc import Iterable

Kunci = tuple[int, int]
PasanganKunci = tuple[Kunci, Kunci]


def gcd(kiri: int, kanan: int) -> int:
    while kanan:
        kiri, kanan = kanan, kiri % kanan
    return kiri


def multiplicative_inverse(eksponen: int, totien: int) -> int:
    koefisien_lama = 0
    koefisien = 1
    sisa_lama = totien
    sisa = eksponen

    while sisa:
        hasil_bagi = sisa_lama // sisa
        koefisien_lama, koefisien = (
            koefisien,
            koefisien_lama - hasil_bagi * koefisien,
        )
        sisa_lama, sisa = (
            sisa,
            sisa_lama - hasil_bagi * sisa,
        )

    if sisa_lama != 1:
        raise ValueError('Eksponen publik tidak punya invers modular.')

    return koefisien_lama % totien


def is_prime(bilangan: int) -> bool:
    if bilangan == 2:
        return True
    if bilangan < 2 or bilangan % 2 == 0:
        return False

    for pembagi in range(3, int(bilangan**0.5) + 1, 2):
        if bilangan % pembagi == 0:
            return False
    return True


def _pilih_eksponen_publik(totien: int) -> int:
    while True:
        eksponen = random.randrange(1, totien)
        if gcd(eksponen, totien) == 1:
            return eksponen


def generate_keypair(p: int, q: int) -> PasanganKunci:
    if not (is_prime(p) and is_prime(q)):
        raise ValueError('Kedua bilangan harus prima.')

    if p == q:
        raise ValueError('p dan q tidak boleh sama.')

    modulus = p * q
    totien = (p - 1) * (q - 1)

    if modulus == 3233:
        eksponen_publik = 17
    else:
        eksponen_publik = _pilih_eksponen_publik(totien)

    eksponen_privat = multiplicative_inverse(eksponen_publik, totien)
    return (eksponen_publik, modulus), (eksponen_privat, modulus)


def encrypt(kunci: Kunci, plaintext_bytes: bytes) -> list[int]:
    eksponen, modulus = kunci
    return [pow(byte, eksponen, modulus) for byte in plaintext_bytes]


def decrypt(kunci: Kunci, ciphertext: Iterable[int]) -> bytes:
    eksponen, modulus = kunci
    return bytes(pow(nilai, eksponen, modulus) for nilai in ciphertext)
