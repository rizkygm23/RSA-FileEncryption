'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ProcessLogs from '@/components/ProcessLogs';
import { signFile } from '@/services/api';
import { PenTool } from 'lucide-react';

export default function SignOp() {
  const [file, setFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [isProcessComplete, setIsProcessComplete] = useState(false);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleSign = async () => {
    if (!file || !keyFile) {
      setError('Choose a file and a private key first.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['Reading the selected file...']);
      await delay(600);
      
      setProcessLogs(prev => [...prev, 'Creating the SHA-256 hash...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Signing the hash with the private key...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, 'Sending the file to the backend...']);
      const signatureBlob = await signFile(file, keyFile);
      
      setProcessLogs(prev => [...prev, 'Signature created. Downloading the signature file...']);
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
      setError('Signing failed. Check the file and private key.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#e2e2e2] pb-5">
        <h2 className="text-2xl font-bold leading-8 text-black">Generate signature</h2>
        <p className="mt-1 text-sm text-[#5e5e5e]">Create a signature for a file with a private key.</p>
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
        onClick={handleSign}
        disabled={loading || !file || !keyFile}
        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:border-[#e2e2e2] disabled:bg-[#efefef] disabled:text-[#afafaf]"
      >
        <PenTool className="h-4 w-4 group-disabled:opacity-50" />
        {loading ? 'Processing...' : 'Sign document'}
      </button>
      
      <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
    </div>
  );
}
