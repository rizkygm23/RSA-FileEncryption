'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ProcessLogs from '@/components/ProcessLogs';
import { decryptFile } from '@/services/api';
import { Unlock } from 'lucide-react';

export default function DecryptOp() {
  const [file, setFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [isProcessComplete, setIsProcessComplete] = useState(false);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleDecrypt = async () => {
    if (!file || !keyFile) {
      setError('Choose an encrypted file and a private key first.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['Reading the encrypted file...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Reading the private key...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Decrypting the file with RSA...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, 'Sending the file to the backend...']);
      const decryptedBlob = await decryptFile(file, keyFile);
      
      setProcessLogs(prev => [...prev, 'Decryption finished. Downloading the original file...']);
      setIsProcessComplete(true);
      
      const originalName = file.name.replace('.encrypted', '');
      
      const url = window.URL.createObjectURL(new Blob([decryptedBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError('Decryption failed. Check the encrypted file and private key.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#e2e2e2] pb-5">
        <h2 className="text-2xl font-bold leading-8 text-black">Decrypt file</h2>
        <p className="mt-1 text-sm text-[#5e5e5e]">Open an encrypted file with its private key.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">
            Encrypted source
          </label>
          <UploadBox onFileSelect={setFile} label="File (.encrypted)" selectedFile={file} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">
            Private key
          </label>
          <UploadBox onFileSelect={setKeyFile} label="Private Key (.txt)" selectedFile={keyFile} />
        </div>
      </div>

      {error && (
        <div className="flex items-center rounded-2xl border border-black bg-[#efefef] p-4 text-sm text-black">
          <span className="mr-2 font-bold">Error:</span> {error}
        </div>
      )}

      <button 
        onClick={handleDecrypt}
        disabled={loading || !file || !keyFile}
        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:border-[#e2e2e2] disabled:bg-[#efefef] disabled:text-[#afafaf]"
      >
        <Unlock className="h-4 w-4 group-disabled:opacity-50" />
        {loading ? 'Decrypting...' : 'Decrypt file'}
      </button>
      
      <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
    </div>
  );
}
