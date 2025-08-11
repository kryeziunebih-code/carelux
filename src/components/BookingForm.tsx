"use client";

import { useState, useTransition } from "react";

export default function BookingForm({
  slotId,
  action,
}: {
  slotId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [isBooked, setIsBooked] = useState(false);
  const [pending, startTransition] = useTransition();

  return isBooked ? (
    <div className="badge">Booked</div>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setIsBooked(true); // optimistic
        startTransition(async () => {
          try { await action(formData); } catch { setIsBooked(false); }
        });
      }}
      className="grid gap-2 w-full max-w-sm"
    >
      <input type="hidden" name="slotId" value={slotId} />
      <div className="grid gap-1">
        <label>Name</label>
        <input name="name" placeholder="Your full name" required disabled={pending} />
      </div>
      <div className="grid gap-1">
        <label>Email</label>
        <input type="email" name="email" placeholder="you@example.com" required disabled={pending} />
      </div>
      <div className="grid gap-1">
        <label>Notes</label>
        <textarea name="notes" placeholder="Optional" disabled={pending} />
      </div>
      <button className="btn" type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Booking…" : "Book"}
      </button>
    </form>
  );
}
