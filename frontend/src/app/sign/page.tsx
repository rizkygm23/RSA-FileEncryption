'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ProcessLogs from '@/components/ProcessLogs';
import { signFile } from '@/services/api';

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [isProcessComplete, setIsProcessComplete] = useState(false);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleSign = async () => {
    if (!file || !keyFile) {
      setError('Please select both a file and a private key.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['Reading target file...']);
      await delay(600);
      
      setProcessLogs(prev => [...prev, 'Generating SHA-256 Hash of the file...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Encrypting the Hash using your Private Key (n, d)...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, 'Creating Digital Signature on secure server...']);
      const signatureBlob = await signFile(file, keyFile);
      
      setProcessLogs(prev => [...prev, 'Signature generated successfully! Downloading...']);
      setIsProcessComplete(true);
      
      const url = window.URL.createObjectURL(new Blob([signatureBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${file.name}.signature.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError('Signing failed. Check your file and private key.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Generate Digital Signature</h1>
        <p className="text-zinc-400">
          Sign your file using your private key to prove its authenticity.
        </p>
      </div>

      <div className="card-dark p-8 rounded-lg">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              1. Upload File to Sign
            </label>
            <UploadBox onFileSelect={setFile} label="File" selectedFile={file} />
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
            onClick={handleSign}
            disabled={loading || !file || !keyFile}
            className="w-full bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-medium py-3 px-4 rounded transition"
          >
            {loading ? 'Signing...' : 'Sign Document'}
          </button>
          
          <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
        </div>
      </div>
    </div>
  );
}
