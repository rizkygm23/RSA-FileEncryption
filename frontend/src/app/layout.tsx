import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CipherVault",
  description: "RSA file encryption, signatures, and chat",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-white text-black">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
