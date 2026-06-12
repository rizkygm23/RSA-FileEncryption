'use client';

// Shared RSA keypair stored in the browser (localStorage) so the user can
// generate once and reuse the same keys across every dashboard feature.

export interface StoredKeyPair {
  public_key: string;
  private_key: string;
  created_at: string;
}

const STORAGE_KEY = 'ciphervault_keypair';

const isBrowser = () => typeof window !== 'undefined';

export const saveKeyPair = (keys: { public_key: string; private_key: string }): StoredKeyPair => {
  const record: StoredKeyPair = {
    public_key: keys.public_key,
    private_key: keys.private_key,
    created_at: new Date().toISOString(),
  };
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  }
  return record;
};

export const loadKeyPair = (): StoredKeyPair | null => {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredKeyPair>;
    if (!parsed.public_key || !parsed.private_key) return null;
    return {
      public_key: parsed.public_key,
      private_key: parsed.private_key,
      created_at: parsed.created_at ?? '',
    };
  } catch {
    return null;
  }
};

export const clearKeyPair = (): void => {
  if (isBrowser()) {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const hasKeyPair = (): boolean => loadKeyPair() !== null;

// Build File objects from the stored keys so they slot straight into the
// existing file-based operations (encrypt/decrypt/sign/verify expect a key File).
export const publicKeyFile = (): File | null => {
  const keys = loadKeyPair();
  if (!keys) return null;
  return new File([keys.public_key], 'public_key.txt', { type: 'text/plain' });
};

export const privateKeyFile = (): File | null => {
  const keys = loadKeyPair();
  if (!keys) return null;
  return new File([keys.private_key], 'private_key.txt', { type: 'text/plain' });
};
