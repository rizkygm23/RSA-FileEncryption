'use client';

import Link from 'next/link';
import { MessageSquareText, PanelsTopLeft } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e2e2e2]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <span className="text-lg font-bold text-black">CipherVault</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-black transition-colors hover:bg-[#efefef] sm:inline-flex"
          >
            <PanelsTopLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/chat"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#282828]"
          >
            <MessageSquareText className="h-4 w-4" />
            Chat
          </Link>
        </div>
      </div>
    </nav>
  );
}
