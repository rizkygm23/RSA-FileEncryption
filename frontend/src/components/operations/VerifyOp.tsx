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
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Verify Signature</h2>
        <p className="text-xs text-slate-500 mt-1">Verify payload integrity and authenticity using the provided public key and signature.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Original Payload
          </label>
          <UploadBox onFileSelect={setFile} label="File" selectedFile={file} />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Public Key
          </label>
          <UploadBox onFileSelect={setKeyFile} label="Public Key (.txt)" selectedFile={keyFile} />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Signature
          </label>
          <UploadBox onFileSelect={setSignatureFile} label="Signature (.txt)" selectedFile={signatureFile} />
        </div>
      </div>

      {error && (
        <div className="text-rose-700 text-xs font-mono bg-rose-50 p-3 border border-rose-200 flex items-center">
          <span className="font-bold mr-2">ERR:</span> {error}
        </div>
      )}

      <button 
        onClick={handleVerify}
        disabled={loading || !file || !keyFile || !signatureFile}
        className="w-full group flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-mono text-sm font-semibold py-3 px-4 transition-colors border border-slate-900 disabled:border-slate-200"
      >
        <FileCheck className="w-4 h-4 group-disabled:opacity-50" />
        {loading ? 'PROCESSING...' : 'EXECUTE VERIFICATION'}
      </button>
      
      <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
      
      {result && <ResultCard isValid={result.valid} message={result.message} />}
    </div>
  );
}
