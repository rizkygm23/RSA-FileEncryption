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
      setError('Missing required files.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['[SYS] Reading encrypted file chunks...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, '[KEY] Reading Private Key (n, d) from file...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, '[RSA] Executing Formula: M = (C ^ d) mod n...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, '[NET] Processing decryption on secure server...']);
      const decryptedBlob = await decryptFile(file, keyFile);
      
      setProcessLogs(prev => [...prev, '[SYS] Decryption successful. Restoring original file...']);
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
      setError('Decryption failed. Validate private key integrity.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Decrypt Payload</h2>
        <p className="text-xs text-slate-500 mt-1">Restore an encrypted file utilizing the corresponding private key.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Encrypted Source
          </label>
          <UploadBox onFileSelect={setFile} label="File (.encrypted)" selectedFile={file} />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Private Key
          </label>
          <UploadBox onFileSelect={setKeyFile} label="Private Key (.txt)" selectedFile={keyFile} />
        </div>
      </div>

      {error && (
        <div className="text-rose-700 text-xs font-mono bg-rose-50 p-3 border border-rose-200 flex items-center">
          <span className="font-bold mr-2">ERR:</span> {error}
        </div>
      )}

      <button 
        onClick={handleDecrypt}
        disabled={loading || !file || !keyFile}
        className="w-full group flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-mono text-sm font-semibold py-3 px-4 transition-colors border border-slate-900 disabled:border-slate-200"
      >
        <Unlock className="w-4 h-4 group-disabled:opacity-50" />
        {loading ? 'PROCESSING...' : 'EXECUTE DECRYPTION'}
      </button>
      
      <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
    </div>
  );
}
