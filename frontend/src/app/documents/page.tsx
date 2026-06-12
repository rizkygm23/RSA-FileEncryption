'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck, FileSignature, PenTool } from 'lucide-react';

import DocumentSignOp from '@/components/documents/DocumentSignOp';
import DocumentVerifyOp from '@/components/documents/DocumentVerifyOp';

type Tab = 'sign' | 'verify';

const tabs: { id: Tab; label: string; icon: typeof PenTool }[] = [
  { id: 'sign', label: 'Sign document', icon: PenTool },
  { id: 'verify', label: 'Verify document', icon: FileCheck },
];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('sign');

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col bg-[#f3f3f3] text-black">
      <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-[#e2e2e2] bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full text-black transition-colors hover:bg-[#efefef]"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm font-medium text-[#5e5e5e]">Documents</p>
            <h1 className="flex items-center gap-2 text-xl font-bold leading-7 text-black md:text-2xl">
              <FileSignature className="h-5 w-5" />
              Sign &amp; verify PDFs
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1040px] space-y-6">
          <section className="rounded-2xl bg-black p-6 text-white sm:p-8">
            <div className="max-w-2xl">
              <p className="mb-2 text-sm font-medium text-[#afafaf]">Digital signature</p>
              <h2 className="text-3xl font-bold leading-10 sm:text-4xl sm:leading-[44px]">
                Sign a PDF letter with a QR signature.
              </h2>
              <p className="mt-3 text-base text-[#efefef]">
                Fill the form, drop the QR onto the page, download the signed PDF, and verify it later.
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)] sm:p-6">
            <div className="mb-5 flex flex-wrap gap-2">
              {tabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
                      isActive ? 'bg-black text-white' : 'bg-[#efefef] text-black hover:bg-[#e2e2e2]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#e2e2e2] bg-white p-5 sm:p-8">
              {activeTab === 'sign' && <DocumentSignOp />}
              {activeTab === 'verify' && <DocumentVerifyOp />}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
