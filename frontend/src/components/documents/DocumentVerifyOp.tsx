'use client';

import { useState } from 'react';
import { FileCheck, Loader2 } from 'lucide-react';

import UploadBox from '@/components/UploadBox';
import ResultCard from '@/components/ResultCard';
import { supabase, type DocumentSignature } from '@/lib/supabase';
import { verifyChatTextSignature } from '@/services/api';
import { buildCanonicalPayload, scanQrFromPdf } from '@/lib/pdfSignature';

// Pull the record id out of a verify URL (/verify/<id>) or a bare id.
const extractId = (text: string): string | null => {
  const trimmed = text.trim();
  const match = trimmed.match(/\/verify\/([0-9a-fA-F-]{6,})/);
  if (match) return match[1];
  if (/^[0-9a-fA-F-]{6,}$/.test(trimmed)) return trimmed;
  return null;
};

export default function DocumentVerifyOp() {
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [meta, setMeta] = useState<DocumentSignature | null>(null);

  const verifyById = async (id: string) => {
    const { data: record, error: dbError } = await supabase
      .from('document_signatures_kriptografi')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (dbError) throw dbError;
    if (!record) {
      setError('No signature record matches this document.');
      return;
    }
    setMeta(record);

    const canonical = buildCanonicalPayload({
      name: record.signer_name,
      reason: record.reason,
      date: record.signed_date,
      filename: record.filename,
      docHash: record.doc_hash,
    });

    const response = await verifyChatTextSignature(canonical, record.signature, record.public_key);
    setResult({ valid: Boolean(response.valid), message: response.message ?? '' });
  };

  const handleVerify = async () => {
    if (!file && !link.trim()) {
      setError('Upload the signed PDF or paste its verify link.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);
      setMeta(null);

      let id: string | null = link.trim() ? extractId(link) : null;

      if (!id && file) {
        const qrText = await scanQrFromPdf(await file.arrayBuffer());
        if (!qrText) {
          setError('No signature QR found in this PDF. Try the verify link instead.');
          return;
        }
        id = extractId(qrText);
      }

      if (!id) {
        setError('This QR / link is not a CipherVault verify link.');
        return;
      }

      await verifyById(id);
    } catch (err) {
      console.error(err);
      setError('Verification failed. Is the backend and database reachable?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#e2e2e2] pb-5">
        <h2 className="text-2xl font-bold leading-8 text-black">Verify document</h2>
        <p className="mt-1 text-sm text-[#5e5e5e]">
          Upload a signed PDF (its QR is scanned automatically) or paste the verify link. No key
          needed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">Signed PDF</label>
          <UploadBox onFileSelect={setFile} label="Signed PDF" selectedFile={file} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">or verify link</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://.../verify/<id>"
            className="min-h-12 w-full rounded-2xl border border-[#e2e2e2] bg-[#efefef] px-4 text-sm text-black placeholder-[#5e5e5e] focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center rounded-2xl border border-black bg-[#efefef] p-4 text-sm text-black">
          <span className="mr-2 font-bold">Error:</span> {error}
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={loading || (!file && !link.trim())}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:border-[#e2e2e2] disabled:bg-[#efefef] disabled:text-[#afafaf]"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
        {loading ? 'Verifying...' : 'Verify signature'}
      </button>

      {result && <ResultCard isValid={result.valid} message={result.message} />}

      {meta && (
        <div className="rounded-2xl border border-[#e2e2e2] bg-white p-5 text-sm">
          <h3 className="mb-3 text-base font-bold text-black">Signature details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-[#5e5e5e]">Signer</dt>
              <dd className="font-medium text-black">{meta.signer_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#5e5e5e]">Purpose</dt>
              <dd className="font-medium text-black">{meta.reason}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#5e5e5e]">Date</dt>
              <dd className="font-medium text-black">{meta.signed_date}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#5e5e5e]">Original file</dt>
              <dd className="truncate font-medium text-black">{meta.filename}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-[#5e5e5e]">Doc hash</dt>
              <dd className="truncate font-mono text-xs text-[#5e5e5e]">{meta.doc_hash}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
