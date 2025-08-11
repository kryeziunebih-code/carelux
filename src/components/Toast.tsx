"use client";

import { useEffect, useState } from "react";

export default function Toast({ message, variant = "ok" }: { message?: string; variant?: "ok" | "err" }) {
  const [show, setShow] = useState(Boolean(message));
  useEffect(() => {
    if (!message) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(t);
  }, [message]);

  if (!show || !message) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow border ${
      variant === "ok"
        ? "bg-brand-cream border-brand-gold text-brand-navy"
        : "bg-white border-red-300 text-red-700"
    }`}>
      {message}
    </div>
  );
}
