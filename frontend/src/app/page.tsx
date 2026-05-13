'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  Activity,
  Cpu,
  FileCheck,
  HardDrive,
  Lock,
  MessageSquareShare,
  PenTool,
  Unlock,
} from 'lucide-react';

import EncryptOp from '@/components/operations/EncryptOp';
import DecryptOp from '@/components/operations/DecryptOp';
import SignOp from '@/components/operations/SignOp';
import VerifyOp from '@/components/operations/VerifyOp';

type Tab = 'encrypt' | 'decrypt' | 'sign' | 'verify';

const operationTabs: {
  id: Tab;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'encrypt',
    label: 'Encrypt',
    description: 'Protect a file with a public key',
    icon: Lock,
  },
  {
    id: 'decrypt',
    label: 'Decrypt',
    description: 'Restore a protected payload',
    icon: Unlock,
  },
  {
    id: 'sign',
    label: 'Sign',
    description: 'Attach a private-key signature',
    icon: PenTool,
  },
  {
    id: 'verify',
    label: 'Verify',
    description: 'Check authenticity and integrity',
    icon: FileCheck,
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('encrypt');
  const activeOperation = operationTabs.find((item) => item.id === activeTab)!;

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col bg-[#f3f3f3] text-black md:flex-row">
      <aside className="relative z-10 flex w-full shrink-0 flex-col border-r border-[#e2e2e2] bg-white md:w-72">
        <div className="flex min-h-20 items-center border-b border-[#e2e2e2] px-5">
          <div>
            <p className="text-base font-bold leading-5">CipherVault</p>
            <p className="text-sm text-[#5e5e5e]">RSA file workspace</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-5">
          <div className="px-3 text-sm font-medium text-[#5e5e5e]">Operations</div>

          {operationTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex min-h-14 items-center gap-3 rounded-lg px-3 text-left transition-colors ${
                  isActive
                    ? 'bg-[#efefef] text-black'
                    : 'text-[#5e5e5e] hover:bg-[#f3f3f3] hover:text-black'
                }`}
              >
                {isActive && <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-black" />}
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-[#5e5e5e]">{item.description}</span>
                </span>
              </button>
            );
          })}

          <div className="mt-6 px-3 text-sm font-medium text-[#5e5e5e]">Comms</div>

          <Link
            href="/chat"
            className="flex min-h-14 items-center gap-3 rounded-lg px-3 text-sm text-[#5e5e5e] transition-colors hover:bg-[#f3f3f3] hover:text-black"
          >
            <MessageSquareShare className="h-4 w-4 shrink-0" />
            <span>
              <span className="block font-medium">Secure chat</span>
              <span className="block text-xs text-[#5e5e5e]">Room-based encrypted messaging</span>
            </span>
          </Link>
        </div>

        <div className="border-t border-[#e2e2e2] bg-black p-5 text-white">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">System status</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              Online
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-[#afafaf]">
            <span>Engine</span>
            <span>RSA-2048</span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-[#e2e2e2] bg-white px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-[#5e5e5e]">Active operation</p>
            <h1 className="text-xl font-bold leading-7 text-black md:text-2xl">{activeOperation.label}</h1>
          </div>

          <div className="hidden items-center gap-2 text-sm text-[#5e5e5e] md:flex">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#efefef] px-4">
              <Activity className="h-4 w-4" />
              42ms
            </span>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#efefef] px-4">
              <HardDrive className="h-4 w-4" />
              12MB
            </span>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#efefef] px-4">
              <Cpu className="h-4 w-4" />
              RSA
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px] space-y-6">
            <section className="rounded-2xl bg-black p-6 text-white sm:p-8">
              <div className="max-w-2xl">
                <p className="mb-2 text-sm font-medium text-[#afafaf]">Secure file cryptography</p>
                <h2 className="text-3xl font-bold leading-10 sm:text-4xl sm:leading-[44px]">
                  Encrypt, decrypt, sign, and verify files in one focused workspace.
                </h2>
                <p className="mt-3 text-base text-[#efefef]">
                  Upload files, attach the matching key artifact, and run RSA operations from a single controlled panel.
                </p>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)] sm:p-6">
              <div className="mb-5 flex flex-wrap gap-2">
                {operationTabs.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'bg-[#efefef] text-black hover:bg-[#e2e2e2]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-[#e2e2e2] bg-white p-5 sm:p-8">
                {activeTab === 'encrypt' && <EncryptOp />}
                {activeTab === 'decrypt' && <DecryptOp />}
                {activeTab === 'sign' && <SignOp />}
                {activeTab === 'verify' && <VerifyOp />}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
