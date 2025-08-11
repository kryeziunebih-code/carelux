'use client';
import Link from "next/link";

export default function Breadcrumbs({ items }: { items: { label: string, href?: string }[] }) {
  return (
    <nav className="text-sm text-brand-navy/80 mb-4">
      {items.map((it, i) => (
        <span key={i}>
          {it.href ? <Link className="link" href={it.href}>{it.label}</Link> : <span>{it.label}</span>}
          {i < items.length - 1 && <span className="mx-2 text-brand-navy/40">/</span>}
        </span>
      ))}
    </nav>
  );
}
