'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ProcessLogs from '@/components/ProcessLogs';
import { encryptFile, generateKey } from '@/services/api';
import { DownloadCloud, KeyRound } from 'lucide-react';

export default function EncryptOp() {
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
      setError('Choose a file and a public key first.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['Reading the selected file...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Reading the public key...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Encrypting the file with RSA...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, 'Sending the file to the backend...']);
      const encryptedBlob = await encryptFile(file, keyFile);
      
      setProcessLogs(prev => [...prev, 'Encryption finished. Downloading the .encrypted file...']);
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
      setError('Encryption failed. Check the file and public key.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-[#e2e2e2] pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold leading-8 text-black">Encrypt file</h2>
          <p className="mt-1 text-sm text-[#5e5e5e]">Encrypt a file with a public key.</p>
        </div>
        <button 
          onClick={handleGenerateKeys}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#efefef] px-4 text-sm font-medium text-black transition-colors hover:bg-[#e2e2e2] disabled:opacity-50"
        >
          <KeyRound className="h-4 w-4" />
          Generate key pair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">
            File
          </label>
          <UploadBox onFileSelect={setFile} label="File" selectedFile={file} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">
            Public key
          </label>
          <UploadBox onFileSelect={setKeyFile} label="Public Key (.txt)" selectedFile={keyFile} />
        </div>
      </div>

      {error && (
        <div className="flex items-center rounded-2xl border border-black bg-[#efefef] p-4 text-sm text-black">
          <span className="mr-2 font-bold">Error:</span> {error}
        </div>
      )}

      <button 
        onClick={handleEncrypt}
        disabled={loading || !file || !keyFile}
        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:border-[#e2e2e2] disabled:bg-[#efefef] disabled:text-[#afafaf]"
      >
        <DownloadCloud className="h-4 w-4 group-disabled:opacity-50" />
        {loading ? 'Encrypting...' : 'Encrypt file'}
      </button>
      
      <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
    </div>
  );
}
