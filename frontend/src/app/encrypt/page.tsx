'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ProcessLogs from '@/components/ProcessLogs';
import { encryptFile, generateKey } from '@/services/api';

export default function EncryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [isProcessComplete, setIsProcessComplete] = useState(false);

  const handleGenerateKeys = async () => {
    try {
      setLoading(true);
      const keys = await generateKey();
      
      const pubBlob = new Blob([keys.public_key], { type: 'text/plain' });
      const pubUrl = URL.createObjectURL(pubBlob);
      const pubLink = document.createElement('a');
      pubLink.href = pubUrl;
      pubLink.download = 'public_key.txt';
      document.body.appendChild(pubLink);
      pubLink.click();
      document.body.removeChild(pubLink);

      const privBlob = new Blob([keys.private_key], { type: 'text/plain' });
      const privUrl = URL.createObjectURL(privBlob);
      const privLink = document.createElement('a');
      privLink.href = privUrl;
      privLink.download = 'private_key.txt';
      document.body.appendChild(privLink);
      privLink.click();
      document.body.removeChild(privLink);
      
    } catch (err) {
      console.error(err);
      setError('Failed to generate keys');
    } finally {
      setLoading(false);
    }
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleEncrypt = async () => {
    if (!file || !keyFile) {
      setError('Please select both a file and a public key.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['Reading target file and extracting bytes...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Reading Public Key (n, e) from file...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Executing RSA Encryption Formula: C = (M ^ e) mod n...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, 'Processing data chunks on secure server...']);
      const encryptedBlob = await encryptFile(file, keyFile);
      
      setProcessLogs(prev => [...prev, 'Encryption successful! Generating .encrypted file...']);
      setIsProcessComplete(true);
      
      const url = window.URL.createObjectURL(new Blob([encryptedBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${file.name}.encrypted`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError('Encryption failed. Check your file and key.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Encrypt Document</h1>
        <p className="text-zinc-400">
          Secure your file so only the recipient with the matching private key can open it.
        </p>
      </div>

      <div className="card-dark p-8 rounded-lg">
        <div className="mb-8 flex justify-end">
          <button 
            onClick={handleGenerateKeys}
            disabled={loading}
            className="text-sm bg-zinc-800 text-zinc-300 font-medium py-2 px-4 rounded border border-zinc-700 hover:bg-zinc-700 transition disabled:opacity-50"
          >
            Generate New Key Pair
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              1. Upload Target File
            </label>
            <UploadBox onFileSelect={setFile} label="File" selectedFile={file} />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              2. Upload Public Key
            </label>
            <UploadBox onFileSelect={setKeyFile} label="Public Key (.txt)" selectedFile={keyFile} />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950/50 p-3 rounded border border-red-900">
              {error}
            </div>
          )}

          <button 
            onClick={handleEncrypt}
            disabled={loading || !file || !keyFile}
            className="w-full bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-medium py-3 px-4 rounded transition"
          >
            {loading ? 'Encrypting...' : 'Encrypt Document'}
          </button>
          
          <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
        </div>
      </div>
    </div>
  );
}
