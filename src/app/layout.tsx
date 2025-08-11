import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "CareLux Health",
  description: "Clinic discovery and appointment booking",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
<div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 0" }}><a href="/login?callbackUrl=%2Fadmin%2Fbookings" className="underline text-sm">Admin</a></div>
        <header className="border-b bg-brand-cream/60 backdrop-blur">
          <div className="container flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.svg" alt="CareLux" width={36} height={36} />
              <span className="text-xl font-bold text-brand-navy">CareLux Health</span>
            </Link>
            <nav className="flex gap-4 text-brand-navy">
              <Link href="/clinics" className="hover:text-brand-gold">Clinics</Link>
              <Link href="/providers" className="hover:text-brand-gold">Providers</Link>
              <Link href="/slots" className="hover:text-brand-gold">Slots</Link>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="border-t mt-12">
          <div className="container py-6 text-sm text-brand-navy/80">
            © {new Date().getFullYear()} CareLux Health
          </div>
        </footer>
      </body>
    </html>
  );
}
