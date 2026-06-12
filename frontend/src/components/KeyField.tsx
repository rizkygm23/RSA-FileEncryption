'use client';

import { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';

import UploadBox from '@/components/UploadBox';
import { hasKeyPair, publicKeyFile, privateKeyFile } from '@/lib/keyStore';

interface KeyFieldProps {
  type: 'public' | 'private';
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
}

// UploadBox for a key file, plus a shortcut to pull the saved browser keypair
// so the user doesn't have to re-upload the key in every operation.
export default function KeyField({ type, selectedFile, onFileSelect }: KeyFieldProps) {
  const [savedAvailable, setSavedAvailable] = useState(false);
  const label = type === 'public' ? 'Public Key (.txt)' : 'Private Key (.txt)';

  useEffect(() => {
    const refresh = () => setSavedAvailable(hasKeyPair());
    refresh();
    // Re-check when the user returns to the tab or saves a key elsewhere,
    // so a key saved after this field mounted still shows up.
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const useSavedKey = () => {
    const file = type === 'public' ? publicKeyFile() : privateKeyFile();
    if (file) onFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <UploadBox onFileSelect={onFileSelect} label={label} selectedFile={selectedFile} />
      {savedAvailable && (
        <button
          type="button"
          onClick={useSavedKey}
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#efefef] px-3 text-xs font-medium text-black transition-colors hover:bg-[#e2e2e2]"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Use saved {type} key
        </button>
      )}
    </div>
  );
}
