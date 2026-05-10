import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-semibold text-lg text-white tracking-tight">
          CipherVault
        </Link>
        <div className="flex gap-8 text-sm">
          <Link href="/encrypt" className="text-zinc-400 hover:text-white transition">Encrypt</Link>
          <Link href="/decrypt" className="text-zinc-400 hover:text-white transition">Decrypt</Link>
          <Link href="/sign" className="text-zinc-400 hover:text-white transition">Sign</Link>
          <Link href="/verify" className="text-zinc-400 hover:text-white transition">Verify</Link>
          <Link href="/chat" className="text-zinc-400 hover:text-white transition">Chat</Link>
        </div>
      </div>
    </nav>
  );
}
