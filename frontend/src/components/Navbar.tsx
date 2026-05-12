import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-indigo-600 tracking-tight flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          CipherVault
        </Link>
        <div className="flex gap-8 text-sm font-medium">
          <Link href="/" className="text-slate-600 hover:text-indigo-600 transition">Suite</Link>
          <Link href="/chat" className="text-slate-600 hover:text-indigo-600 transition">Secure Chat</Link>
        </div>
      </div>
    </nav>
  );
}
