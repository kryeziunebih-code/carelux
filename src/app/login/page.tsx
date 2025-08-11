"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/admin/bookings";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.ok) router.push(callbackUrl);
    else alert("Invalid email or password");
  }

  return (
    <div className="max-w-md mx-auto mt-16 card">
      <h1 className="text-2xl font-semibold mb-4">Admin login</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span>Email</span>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <label className="grid gap-1">
          <span>Password</span>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </label>
        <button className="btn" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </div>
  );
}
