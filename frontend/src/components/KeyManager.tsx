'use client';

import { useEffect, useState } from 'react';
import { Check, DownloadCloud, KeyRound, RefreshCw, Save, Trash2 } from 'lucide-react';

import { generateKey } from '@/services/api';
import {
  clearKeyPair,
  loadKeyPair,
  saveKeyPair,
  type StoredKeyPair,
} from '@/lib/keyStore';

interface KeyPair {
  public_key: string;
  private_key: string;
}

const downloadKeyPair = (keys: KeyPair) => {
  const files: [string, string][] = [
    ['public_key.txt', keys.public_key],
    ['private_key.txt', keys.private_key],
  ];

  for (const [name, content] of files) {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
};

// One place to generate an RSA keypair, then either download it (as before)
// or save it in the browser for reuse across every dashboard feature.
export default function KeyManager() {
  const [keys, setKeys] = useState<KeyPair | null>(null);
  const [stored, setStored] = useState<StoredKeyPair | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStored(loadKeyPair());
  }, []);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      setSavedNotice(false);
      const result = await generateKey();
      setKeys({ public_key: result.public_key, private_key: result.private_key });
    } catch (err) {
      console.error(err);
      setError('Failed to generate keys. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (keys) downloadKeyPair(keys);
  };

  const handleSave = () => {
    if (!keys) return;
    const record = saveKeyPair(keys);
    setStored(record);
    setSavedNotice(true);
  };

  const handleClear = () => {
    clearKeyPair();
    setStored(null);
    setSavedNotice(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-[#e2e2e2] pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold leading-8 text-black">Keys</h2>
          <p className="mt-1 text-sm text-[#5e5e5e]">
            Generate an RSA key pair, then download it or save it in this browser.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:opacity-50"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {loading ? 'Generating...' : keys ? 'Generate again' : 'Generate key pair'}
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-[#e2e2e2] bg-[#efefef] p-4 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${stored ? 'bg-black' : 'bg-[#afafaf]'}`}
        />
        <span className="font-medium text-black">
          {stored ? 'Saved key present in this browser' : 'No key saved in this browser'}
        </span>
        {stored && (
          <button
            onClick={handleClear}
            className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium text-black transition-colors hover:bg-[#e2e2e2]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center rounded-2xl border border-black bg-[#efefef] p-4 text-sm text-black">
          <span className="mr-2 font-bold">Error:</span> {error}
        </div>
      )}

      {keys && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">Public key</label>
              <pre className="overflow-x-auto rounded-2xl border border-[#e2e2e2] bg-white p-4 text-xs text-black">
                {keys.public_key}
              </pre>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">Private key</label>
              <pre className="overflow-x-auto rounded-2xl border border-[#e2e2e2] bg-white p-4 text-xs text-black">
                {keys.private_key}
              </pre>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleDownload}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-black bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-[#efefef]"
            >
              <DownloadCloud className="h-4 w-4" />
              Download key files
            </button>
            <button
              onClick={handleSave}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-[#282828]"
            >
              {savedNotice ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {savedNotice ? 'Saved to browser' : 'Save to browser'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
