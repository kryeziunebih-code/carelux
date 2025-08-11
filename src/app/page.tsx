import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <section className="card">
        <h1 className="text-2xl font-semibold mb-2">Welcome to CareLux Health</h1>
        <p className="text-gray-600">
          Browse clinics, find providers, and book available slots.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/clinics" className="badge">View Clinics</Link>
          <Link href="/providers" className="badge">View Providers</Link>
          <Link href="/slots" className="badge">View Slots</Link>
        </div>
      </section>
    </div>
  );
}
