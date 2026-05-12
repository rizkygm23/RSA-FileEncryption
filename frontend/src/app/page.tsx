'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Unlock, PenTool, FileCheck, ShieldAlert, Shield, Activity, HardDrive, Cpu, MessageSquareShare } from 'lucide-react';

import EncryptOp from '@/components/operations/EncryptOp';
import DecryptOp from '@/components/operations/DecryptOp';
import SignOp from '@/components/operations/SignOp';
import VerifyOp from '@/components/operations/VerifyOp';

type Tab = 'encrypt' | 'decrypt' | 'sign' | 'verify';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('encrypt');

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Sidebar Rail */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 relative z-10">
        
        {/* Brand */}
        <div className="h-14 border-b border-slate-200 flex items-center px-4 gap-3 bg-slate-50">
          <Shield className="w-5 h-5 text-slate-800" />
          <span className="font-bold text-sm tracking-tight text-slate-800">CIPHER_VAULT</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-2">
            Operations
          </div>
          
          <button
            onClick={() => setActiveTab('encrypt')}
            className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left ${
              activeTab === 'encrypt' 
                ? 'bg-slate-100 text-slate-900 font-medium border-l-2 border-slate-900' 
                : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>Encrypt</span>
          </button>
          
          <button
            onClick={() => setActiveTab('decrypt')}
            className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left ${
              activeTab === 'decrypt' 
                ? 'bg-slate-100 text-slate-900 font-medium border-l-2 border-slate-900' 
                : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
            }`}
          >
            <Unlock className="w-4 h-4 shrink-0" />
            <span>Decrypt</span>
          </button>
          
          <button
            onClick={() => setActiveTab('sign')}
            className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left ${
              activeTab === 'sign' 
                ? 'bg-slate-100 text-slate-900 font-medium border-l-2 border-slate-900' 
                : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
            }`}
          >
            <PenTool className="w-4 h-4 shrink-0" />
            <span>Sign</span>
          </button>
          
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left ${
              activeTab === 'verify' 
                ? 'bg-slate-100 text-slate-900 font-medium border-l-2 border-slate-900' 
                : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            <span>Verify</span>
          </button>

          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-6">
            Comms
          </div>
          
          <Link
            href="/chat"
            className="flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left text-slate-600 hover:bg-slate-50 border-l-2 border-transparent"
          >
            <MessageSquareShare className="w-4 h-4 shrink-0" />
            <span>Secure Chat</span>
          </Link>
        </div>

        {/* System Status Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs font-mono text-slate-500">
          <div className="flex items-center justify-between mb-2">
            <span>SYS_STATUS</span>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>ONLINE</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>ENGINE</span>
            <span>RSA-2048</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Strip */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 font-mono text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>PID: 8492</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>MEM: 12MB</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>LATENCY: 42ms</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Secure Context
            </span>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            
            {/* The Active Operation Pane */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="p-6 sm:p-8">
                {activeTab === 'encrypt' && <EncryptOp />}
                {activeTab === 'decrypt' && <DecryptOp />}
                {activeTab === 'sign' && <SignOp />}
                {activeTab === 'verify' && <VerifyOp />}
              </div>
            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
