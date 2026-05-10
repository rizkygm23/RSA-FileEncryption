import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-16">
        <h1 className="text-5xl font-bold mb-4 text-white tracking-tight">
          CipherVault v3
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Secure file communication and digital verification platform. Demonstrates RSA encryption and digital signatures for confidentiality, authentication, integrity, and non-repudiation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Link href="/encrypt" className="group">
          <div className="card-dark p-8 rounded-lg hover:border-zinc-700 transition-colors">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Encrypt Files</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Encrypt documents using RSA public key cryptography. Only the holder of the matching private key can decrypt and access the content.
              </p>
            </div>
            <div className="text-zinc-500 text-sm group-hover:text-zinc-400 transition-colors">
              Confidentiality →
            </div>
          </div>
        </Link>

        <Link href="/decrypt" className="group">
          <div className="card-dark p-8 rounded-lg hover:border-zinc-700 transition-colors">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Decrypt Files</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Decrypt encrypted files using your RSA private key. Restore the original document securely without exposing sensitive data.
              </p>
            </div>
            <div className="text-zinc-500 text-sm group-hover:text-zinc-400 transition-colors">
              Access Control →
            </div>
          </div>
        </Link>

        <Link href="/sign" className="group">
          <div className="card-dark p-8 rounded-lg hover:border-zinc-700 transition-colors">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Sign Documents</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Create digital signatures using SHA-256 hashing and RSA encryption. Prove document authenticity and prevent sender repudiation.
              </p>
            </div>
            <div className="text-zinc-500 text-sm group-hover:text-zinc-400 transition-colors">
              Authentication →
            </div>
          </div>
        </Link>

        <Link href="/verify" className="group">
          <div className="card-dark p-8 rounded-lg hover:border-zinc-700 transition-colors">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Verify Signatures</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Verify digital signatures against public keys. Detect tampering and confirm document integrity using cryptographic validation.
              </p>
            </div>
            <div className="text-zinc-500 text-sm group-hover:text-zinc-400 transition-colors">
              Integrity Check →
            </div>
          </div>
        </Link>

        <Link href="/chat" className="group md:col-span-2">
          <div className="card-dark p-8 rounded-lg hover:border-zinc-700 transition-colors border-2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">🔒 Secure Chat (New)</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                End-to-end encrypted messaging with automatic RSA encryption and digital signatures. Send text messages and files securely with real-time communication.
              </p>
            </div>
            <div className="text-zinc-500 text-sm group-hover:text-zinc-400 transition-colors">
              Start Secure Messaging →
            </div>
          </div>
        </Link>

      </div>

      <div className="mt-16 pt-16 border-t border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Security Principles</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-white font-medium mb-1">Confidentiality</div>
            <div className="text-zinc-500 text-sm">RSA Encryption</div>
          </div>
          <div>
            <div className="text-white font-medium mb-1">Authentication</div>
            <div className="text-zinc-500 text-sm">Digital Signature</div>
          </div>
          <div>
            <div className="text-white font-medium mb-1">Integrity</div>
            <div className="text-zinc-500 text-sm">SHA-256 Hash</div>
          </div>
          <div>
            <div className="text-white font-medium mb-1">Non-Repudiation</div>
            <div className="text-zinc-500 text-sm">Signature Verification</div>
          </div>
        </div>
      </div>
    </div>
  );
}
