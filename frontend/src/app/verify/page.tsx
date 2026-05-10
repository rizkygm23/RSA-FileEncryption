'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ResultCard from '@/components/ResultCard';
import ProcessLogs from '@/components/ProcessLogs';
import { verifySignature } from '@/services/api';

export default function VerifyPage() {
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
      setError('Please select the original file, public key, and signature file.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setResult(null);
      setIsProcessComplete(false);
      setProcessLogs([]);
      
      setProcessLogs(['Reading original file and generating new SHA-256 Hash...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Reading Signature File and Public Key (n, e)...']);
      await delay(800);
      
      setProcessLogs(prev => [...prev, 'Decrypting Signature with RSA: Hash = (S ^ e) mod n...']);
      await delay(1000);
      
      setProcessLogs(prev => [...prev, 'Comparing original Hash with decrypted Hash...']);
      const response = await verifySignature(file, keyFile, signatureFile);
      
      setProcessLogs(prev => [...prev, 'Verification process finished.']);
      setIsProcessComplete(true);
      
      setResult({
        valid: response.valid,
        message: response.message
      });
      
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please check your files and try again.');
      setIsProcessComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Verify Digital Signature</h1>
        <p className="text-zinc-400">
          Verify the authenticity and integrity of a file using a public key and its digital signature.
        </p>
      </div>

      <div className="card-dark p-8 rounded-lg">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              1. Upload Original File
            </label>
            <UploadBox onFileSelect={setFile} label="Original File" selectedFile={file} />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              2. Upload Public Key
            </label>
            <UploadBox onFileSelect={setKeyFile} label="Public Key (.txt)" selectedFile={keyFile} />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              3. Upload Signature File
            </label>
            <UploadBox onFileSelect={setSignatureFile} label="Signature (.signature.txt)" selectedFile={signatureFile} />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950/50 p-3 rounded border border-red-900">
              {error}
            </div>
          )}

          <button 
            onClick={handleVerify}
            disabled={loading || !file || !keyFile || !signatureFile}
            className="w-full bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-medium py-3 px-4 rounded transition"
          >
            {loading ? 'Verifying...' : 'Verify Authenticity'}
          </button>
          
          <ProcessLogs logs={processLogs} isComplete={isProcessComplete} />
          
          {result && <ResultCard isValid={result.valid} message={result.message} />}
        </div>
      </div>
    </div>
  );
}
