'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, ShieldQuestion, XCircle } from 'lucide-react';

import { supabase, type DocumentSignature } from '@/lib/supabase';
import { verifyChatTextSignature } from '@/services/api';
import { buildCanonicalPayload } from '@/lib/pdfSignature';

type State =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | { status: 'done'; record: DocumentSignature; valid: boolean; message: string };

export default function VerifyPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const run = async () => {
      try {
        const { data: record, error } = await supabase
          .from('document_signatures_kriptografi')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;
        if (!record) {
          setState({ status: 'not_found' });
          return;
        }

        const canonical = buildCanonicalPayload({
          name: record.signer_name,
          reason: record.reason,
          date: record.signed_date,
          filename: record.filename,
          docHash: record.doc_hash,
        });

        const result = await verifyChatTextSignature(
          canonical,
          record.signature,
          record.public_key,
        );

        if (cancelled) return;
        setState({
          status: 'done',
          record,
          valid: Boolean(result.valid),
          message: result.message ?? '',
        });
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setState({ status: 'error', message: 'Could not verify this document. Is the backend running?' });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f3f3f3] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.12)] sm:p-8">
        <div className="mb-5 flex items-center gap-2 border-b border-[#e2e2e2] pb-4">
          <ShieldQuestion className="h-5 w-5 text-black" />
          <h1 className="text-lg font-bold text-black">Document verification</h1>
        </div>

        {state.status === 'loading' && (
          <div className="flex items-center gap-3 py-8 text-sm text-[#5e5e5e]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying signature...
          </div>
        )}

        {state.status === 'not_found' && (
          <div className="rounded-2xl border border-[#e2e2e2] bg-[#efefef] p-5 text-sm text-black">
            <p className="font-bold">Not found</p>
            <p className="mt-1 text-[#5e5e5e]">No signature record matches this link.</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="rounded-2xl border border-black bg-[#efefef] p-5 text-sm text-black">
            <p className="font-bold">Error</p>
            <p className="mt-1 text-[#5e5e5e]">{state.message}</p>
          </div>
        )}

        {state.status === 'done' && (
          <div className="space-y-5">
            <div
              className={`flex items-start gap-3 rounded-2xl border p-5 ${
                state.valid ? 'border-black bg-black text-white' : 'border-[#e2e2e2] bg-[#efefef] text-black'
              }`}
            >
              {state.valid ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <div>
                <h2 className="text-base font-bold">
                  {state.valid ? 'Signature valid' : 'Signature invalid'}
                </h2>
                <p className={`text-sm ${state.valid ? 'text-[#efefef]' : 'text-[#5e5e5e]'}`}>
                  {state.message}
                </p>
              </div>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#5e5e5e]">Signer</dt>
                <dd className="font-medium text-black">{state.record.signer_name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#5e5e5e]">Purpose</dt>
                <dd className="font-medium text-black">{state.record.reason}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#5e5e5e]">Date</dt>
                <dd className="font-medium text-black">{state.record.signed_date}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#5e5e5e]">Original file</dt>
                <dd className="truncate font-medium text-black">{state.record.filename}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-[#5e5e5e]">Doc hash</dt>
                <dd className="truncate font-mono text-xs text-[#5e5e5e]">{state.record.doc_hash}</dd>
              </div>
            </dl>

            <p className="border-t border-[#efefef] pt-3 text-xs text-[#5e5e5e]">
              A valid result means the signer details and original-file hash were signed with the
              matching private key and have not been altered in the database.
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-[#e2e2e2] pt-4 text-center">
          <Link href="/documents" className="text-sm font-medium text-black underline">
            Go to Documents
          </Link>
        </div>
      </div>
    </div>
  );
}
