'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ResultCard from '@/components/ResultCard';
import ProcessLogs from '@/components/ProcessLogs';
import { verifySignature } from '@/services/api';
import { FileCheck } from 'lucide-react';

export default function VerifyOp() {
  const [file, setFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{valid: boolean; message: string} | null>(null);
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [isProcessComplete, setIsProcessComplete] = useState(false);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleVerify = async () => {
    if (!file || !keyFile || !signatureFile) {
      setError('Missing required files.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setResult(null);
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['[SYS] Reading original file and generating new SHA-256 Hash...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, '[KEY] Reading Signature File and Public Key (n, e)...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, '[RSA] Decrypting Signature: Hash = (S ^ e) mod n...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, '[HASH] Comparing original Hash with decrypted Hash...']);
      const response = await verifySignature(file, keyFile, signatureFile);
      
      setProcessLogs(prev => [...prev, '[SYS] Verification process finished.']);
      setIsProcessComplete(true);
      
      setResult({
        valid: response.valid,
        message: response.message
      });
      
    } catch (err) {
      console.error(err);
      setError('Verification failed. Validate payload and public key integrity.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#e2e2e2] pb-5">
        <h2 className="text-2xl font-bold leading-8 text-black">Verify signature</h2>
        <p className="mt-1 text-sm text-[#5e5e5e]">Verify payload integrity and authenticity using the provided public key and signature.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">
            Original payload
          </label>
          <UploadBox onFileSelect={setFile} label="File" selectedFile={file} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">
            Public key
          </label>
          <UploadBox onFileSelect={setKeyFile} label="Public Key (.txt)" selectedFile={keyFile} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">
            Signature
          </label>
          <UploadBox onFileSelect={setSignatureFile} label="Signature (.txt)" selectedFile={signatureFile} />
        </div>
      </div>

      {error && (
        <div className="flex items-center rounded-2xl border border-black bg-[#efefef] p-4 text-sm text-black">
          <span className="mr-2 font-bold">Error:</span> {error}
        </div>
      )}

      <button 
        onClick={handleVerify}
        disabled={loading || !file || !keyFile || !signatureFile}
        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:border-[#e2e2e2] disabled:bg-[#efefef] disabled:text-[#afafaf]"
      >
        <FileCheck className="h-4 w-4 group-disabled:opacity-50" />
        {loading ? 'Processing...' : 'Execute verification'}
      </button>
      
      <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
      
      {result && <ResultCard isValid={result.valid} message={result.message} />}
    </div>
  );
}
