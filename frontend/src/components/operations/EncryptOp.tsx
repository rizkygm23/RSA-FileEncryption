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
      setError('Missing required files.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['[SYS] Reading target file and extracting bytes...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, '[KEY] Reading Public Key (n, e) from file...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, '[RSA] Executing Formula: C = (M ^ e) mod n...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, '[NET] Processing data chunks on secure server...']);
      const encryptedBlob = await encryptFile(file, keyFile);
      
      setProcessLogs(prev => [...prev, '[SYS] Encryption successful. Generating .encrypted artifact...']);
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
      setError('Encryption failed. Check file and key integrity.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Encrypt Target</h2>
          <p className="text-xs text-slate-500 mt-1">Apply RSA encryption using a designated public key.</p>
        </div>
        <button 
          onClick={handleGenerateKeys}
          disabled={loading}
          className="flex items-center gap-2 text-xs bg-white text-slate-700 font-semibold py-1.5 px-3 border border-slate-300 hover:bg-slate-50 hover:text-indigo-600 transition-colors disabled:opacity-50"
        >
          <KeyRound className="w-3.5 h-3.5" />
          GENERATE KEY PAIR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Target File
          </label>
          <UploadBox onFileSelect={setFile} label="File" selectedFile={file} />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Public Key
          </label>
          <UploadBox onFileSelect={setKeyFile} label="Public Key (.txt)" selectedFile={keyFile} />
        </div>
      </div>

      {error && (
        <div className="text-rose-700 text-xs font-mono bg-rose-50 p-3 border border-rose-200 flex items-center">
          <span className="font-bold mr-2">ERR:</span> {error}
        </div>
      )}

      <button 
        onClick={handleEncrypt}
        disabled={loading || !file || !keyFile}
        className="w-full group flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-mono text-sm font-semibold py-3 px-4 transition-colors border border-slate-900 disabled:border-slate-200"
      >
        <DownloadCloud className="w-4 h-4 group-disabled:opacity-50" />
        {loading ? 'PROCESSING...' : 'EXECUTE ENCRYPTION'}
      </button>
      
      <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
    </div>
  );
}
