'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ProcessLogs from '@/components/ProcessLogs';
import { decryptFile } from '@/services/api';

export default function DecryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [isProcessComplete, setIsProcessComplete] = useState(false);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleDecrypt = async () => {
    if (!file || !keyFile) {
      setError('Please select both an encrypted file and a private key.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['Reading encrypted ciphertext file...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Reading Private Key (n, d) from file...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Executing RSA Decryption Formula: M = (C ^ d) mod n...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, 'Decrypting data chunks on secure server...']);
      const decryptedBlob = await decryptFile(file, keyFile);
      
      setProcessLogs(prev => [...prev, 'Decryption successful! Restoring original file...']);
      setIsProcessComplete(true);
      
      const url = window.URL.createObjectURL(new Blob([decryptedBlob]));
      const link = document.createElement('a');
      link.href = url;
      
      let downloadName = 'decrypted_file';
      if (file.name.endsWith('.encrypted')) {
        downloadName = file.name.replace('.encrypted', '');
      } else {
        downloadName = 'decrypted_' + file.name;
      }
      
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError('Decryption failed. Check your file and key.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Decrypt Document</h1>
        <p className="text-zinc-400">
          Use your private key to decrypt the document and read the contents safely.
        </p>
      </div>

      <div className="card-dark p-8 rounded-lg">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              1. Upload Encrypted File
            </label>
            <UploadBox onFileSelect={setFile} label="Encrypted File (.encrypted)" selectedFile={file} />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              2. Upload Private Key
            </label>
            <UploadBox onFileSelect={setKeyFile} label="Private Key (.txt)" selectedFile={keyFile} />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950/50 p-3 rounded border border-red-900">
              {error}
            </div>
          )}

          <button 
            onClick={handleDecrypt}
            disabled={loading || !file || !keyFile}
            className="w-full bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-medium py-3 px-4 rounded transition"
          >
            {loading ? 'Decrypting...' : 'Decrypt Document'}
          </button>
          
          <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
        </div>
      </div>
    </div>
  );
}
