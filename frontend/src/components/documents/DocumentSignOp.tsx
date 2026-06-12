'use client';

import { useCallback, useState } from 'react';
import { DownloadCloud, FileSignature, Loader2, PenTool } from 'lucide-react';

import UploadBox from '@/components/UploadBox';
import KeyField from '@/components/KeyField';
import DocumentPreview from '@/components/documents/DocumentPreview';
import { supabase } from '@/lib/supabase';
import { signFile } from '@/services/api';
import {
  buildCanonicalPayload,
  makeQrDataUrl,
  sha256Hex,
  stampQrOntoPdf,
  type PlacedSignature,
} from '@/lib/pdfSignature';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function DocumentSignOp() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [privateKey, setPrivateKey] = useState<File | null>(null);
  const [publicKey, setPublicKey] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(todayIso());

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [placement, setPlacement] = useState<PlacedSignature | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  // Any change to the inputs invalidates a previously prepared signature.
  const resetSignature = useCallback(() => {
    setQrDataUrl(null);
    setVerifyUrl(null);
    setPlacement(null);
  }, []);

  const handleFileSelect = async (selected: File) => {
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file. Convert Word documents to PDF first.');
      return;
    }
    setError('');
    setFile(selected);
    resetSignature();
    setPdfBytes(await selected.arrayBuffer());
  };

  const handlePrepare = async () => {
    if (!file || !pdfBytes || !privateKey || !publicKey || !name.trim() || !reason.trim()) {
      setError('Fill name, purpose, upload a PDF, and choose both keys.');
      return;
    }

    try {
      setPreparing(true);
      setError('');

      const docHash = await sha256Hex(pdfBytes.slice(0));
      const canonical = buildCanonicalPayload({
        name: name.trim(),
        reason: reason.trim(),
        date,
        filename: file.name,
        docHash,
      });

      // Sign the canonical metadata (reuses the existing /sign endpoint).
      const canonicalFile = new File([canonical], 'payload.txt', { type: 'text/plain' });
      const sigBlob = await signFile(canonicalFile, privateKey);
      const sig = (await sigBlob.text()).trim();
      const publicKeyText = await publicKey.text();

      // Persist the record; the QR will only carry the verify URL.
      const { data: row, error: insertError } = await supabase
        .from('document_signatures_kriptografi')
        .insert({
          signer_name: name.trim(),
          reason: reason.trim(),
          signed_date: date,
          filename: file.name,
          doc_hash: docHash,
          signature: sig,
          public_key: publicKeyText,
        })
        .select()
        .single();

      if (insertError || !row) throw insertError ?? new Error('Insert failed');

      const url = `${window.location.origin}/verify/${row.id}`;
      setVerifyUrl(url);
      setQrDataUrl(await makeQrDataUrl(url));
      setPlacement(null); // preview drops it onto the page center
    } catch (err) {
      console.error(err);
      setError('Could not prepare the signature. Check the keys, backend, and database.');
    } finally {
      setPreparing(false);
    }
  };

  const handleApply = async () => {
    if (!pdfBytes || !qrDataUrl || !placement || !file) return;

    try {
      setApplying(true);
      setError('');

      const caption = `Verify: ${name.trim()} - ${date}`;
      const signedBytes = await stampQrOntoPdf(pdfBytes.slice(0), qrDataUrl, placement, caption);

      const blob = new Blob([signedBytes.slice().buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed-${file.name.replace(/\.pdf$/i, '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Could not stamp the PDF.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#e2e2e2] pb-5">
        <h2 className="text-2xl font-bold leading-8 text-black">Sign document</h2>
        <p className="mt-1 text-sm text-[#5e5e5e]">
          Fill the form, save the signature, drag the QR onto the PDF, then download. The QR holds a
          verify link only.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">Signer name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              resetSignature();
            }}
            placeholder="e.g. Budi Santoso"
            className="min-h-12 w-full rounded-2xl border border-[#e2e2e2] bg-[#efefef] px-4 text-sm text-black placeholder-[#5e5e5e] focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">Purpose / title</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              resetSignature();
            }}
            placeholder="e.g. Surat Pernyataan"
            className="min-h-12 w-full rounded-2xl border border-[#e2e2e2] bg-[#efefef] px-4 text-sm text-black placeholder-[#5e5e5e] focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              resetSignature();
            }}
            className="min-h-12 w-full rounded-2xl border border-[#e2e2e2] bg-[#efefef] px-4 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">Private key (signs)</label>
          <KeyField
            type="private"
            selectedFile={privateKey}
            onFileSelect={(f) => {
              setPrivateKey(f);
              resetSignature();
            }}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">Public key (stored for verify)</label>
          <KeyField
            type="public"
            selectedFile={publicKey}
            onFileSelect={(f) => {
              setPublicKey(f);
              resetSignature();
            }}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5e5e5e]">PDF document</label>
          <UploadBox onFileSelect={handleFileSelect} label="PDF file" selectedFile={file} />
        </div>
      </div>

      {error && (
        <div className="flex items-center rounded-2xl border border-black bg-[#efefef] p-4 text-sm text-black">
          <span className="mr-2 font-bold">Error:</span> {error}
        </div>
      )}

      <button
        onClick={handlePrepare}
        disabled={preparing || !file || !privateKey || !publicKey || !name.trim() || !reason.trim()}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:border-[#e2e2e2] disabled:bg-[#efefef] disabled:text-[#afafaf]"
      >
        {preparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
        {preparing ? 'Saving signature...' : 'Save signature & make QR'}
      </button>

      {verifyUrl && (
        <div className="rounded-2xl border border-[#e2e2e2] bg-[#efefef] p-4 text-xs text-[#5e5e5e]">
          <span className="font-medium text-black">Verify link:</span>{' '}
          <span className="break-all font-mono">{verifyUrl}</span>
        </div>
      )}

      {pdfBytes && (
        <DocumentPreview
          pdfBytes={pdfBytes}
          qrDataUrl={qrDataUrl}
          placement={placement}
          onPlacementChange={setPlacement}
        />
      )}

      {qrDataUrl && placement && (
        <button
          onClick={handleApply}
          disabled={applying}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-black bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#282828] disabled:opacity-50"
        >
          {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadCloud className="h-4 w-4" />}
          {applying ? 'Stamping...' : 'Apply & download signed PDF'}
        </button>
      )}

      {!pdfBytes && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#e2e2e2] bg-[#efefef] p-4 text-sm text-[#5e5e5e]">
          <FileSignature className="h-4 w-4 shrink-0" />
          Upload a PDF to see the preview and place the signature.
        </div>
      )}
    </div>
  );
}
