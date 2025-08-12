import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Toast from "../../components/Toast";
import { sendEmail } from "../../lib/mailer";
import { bookingCustomerHtml, bookingAdminHtml } from "../../lib/emailTemplates";
import BookingForm from "../../components/BookingForm";
import Pagination from "../../components/Pagination";
import { createCalendarEvent } from "../../lib/calendar"; // Make sure this import is at the top

type Params = {
  searchParams?: {
    date?: string;
    available?: string;
    q?: string;
    page?: string;
    perPage?: string;
    ok?: string;
    err?: string;
  };
};

async function bookSlot(formData: FormData) {
  "use server";
  const slotId = String(formData.get("slotId") || "");
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const notes = String(formData.get("notes") || "");

  if (!slotId || !name || !email) {
    redirect("/slots?err=missing");
  }

  try {
    // This part remains the same
    await prisma.booking.create({
      data: { slotId, patientName: name, patientEmail: email, notes: notes || null },
    });
    await prisma.slot.update({ where: { id: slotId }, data: { booked: true } });

    // --- Start of New/Modified Section ---
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { clinic: true, provider: true },
    });

    if (slot) {
      // 1. Prepare calendar event details
      const startsAt = new Date(slot.startsAt);
      const endsAt = new Date(startsAt.getTime() + slot.durationMin * 60000);
      const event = await createCalendarEvent({
        title: `Appointment: ${slot.provider.name} at ${slot.clinic.name}`,
        description: `Your confirmed booking details. Notes: ${notes || "None"}`,
        location: `${slot.clinic.name}, ${slot.clinic.city}`,
        start: [startsAt.getFullYear(), startsAt.getMonth() + 1, startsAt.getDate(), startsAt.getHours(), startsAt.getMinutes()],
        end: [endsAt.getFullYear(), endsAt.getMonth() + 1, endsAt.getDate(), endsAt.getHours(), endsAt.getMinutes()],
        status: 'CONFIRMED',
        organizer: { name: "CareLux Health", email: process.env.SMTP_FROM || 'noreply@carelux.app' },
        attendees: [
          { name: name, email: email, rsvp: true, partstat: 'NEEDS-ACTION', role: 'REQ-PARTICIPANT' }
        ]
      });

      // 2. Prepare email attachments
      const attachments = [{
        filename: 'invite.ics',
        content: event,
        contentType: 'text/calendar; method=REQUEST',
      }];

      // 3. Prepare email HTML content (no changes here)
      const appUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
      const customerHtml = bookingCustomerHtml({
        logoCid: "logo", // Assuming a logo cid is used, otherwise adjust as needed
        clinicName: slot.clinic.name,
        clinicCity: slot.clinic.city,
        providerName: slot.provider.name,
        startsAtISO: slot.startsAt.toISOString(),
        durationMin: slot.durationMin,
        appUrl,
      });
      const adminHtml = bookingAdminHtml({
        logoCid: "logo", // Assuming a logo cid is used
        clinicName: slot.clinic.name,
        clinicCity: slot.clinic.city,
        providerName: slot.provider.name,
        startsAtISO: slot.startsAt.toISOString(),
        durationMin: slot.durationMin,
        patientName: name,
        patientEmail: email,
        appUrl,
      });

      // 4. Send emails
      const adminEmailAddr = process.env.ADMIN_EMAIL || process.env.SMTP_USER || '';
      try {
        if (email) await sendEmail({ to: email, subject: 'Your CareLux booking is confirmed', html: customerHtml, attachments }); // Pass attachments here
        if (adminEmailAddr) await sendEmail({ to: adminEmailAddr, subject: 'New CareLux booking', html: adminHtml }); // Admin email, no attachment
      } catch (e) {
        console.warn('[booking] Email send failed', e);
      }
    }
    // --- End of New/Modified Section ---

  } catch (e) {
    console.error("Booking failed:", e);
    redirect("/slots?err=booked");
  }

  revalidatePath("/slots");
  redirect("/slots?ok=1");
}
export default async function SlotsPage({ searchParams }: Params) {
  const q = (searchParams?.q || "").trim();
  const date = (searchParams?.date || "").trim(); // YYYY-MM-DD
  const availableOnly = searchParams?.available === "1";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const perPage = Math.max(1, parseInt(searchParams?.perPage || "12", 10) || 12);

  // Build where
  const where: any = {};
  if (availableOnly) where.booked = false;

  if (date) {
    const start = new Date(date + "T00:00:00");
    const end = new Date(start.getTime() + 24 * 3600 * 1000);
    where.startsAt = { gte: start, lt: end };
  }

  if (q) {
    const [providers, clinics] = await Promise.all([
      prisma.provider.findMany({ where: { name: { contains: q } }, select: { id: true } }),
      prisma.clinic.findMany({ where: { OR: [{ name: { contains: q } }, { city: { contains: q } }] }, select: { id: true } }),
    ]);
    const providerIds = providers.map(p => p.id);
    const clinicIds = clinics.map(c => c.id);
    where.OR = [
      { providerId: { in: providerIds } },
      { clinicId: { in: clinicIds } },
    ];
  }

  const total = await prisma.slot.count({ where });

  const slots = await prisma.slot.findMany({
    where,
    include: { provider: true, clinic: true },
    orderBy: { startsAt: "asc" },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Slots</h1>

      <Toast
        message={
          searchParams?.ok ? "Booking confirmed." :
          searchParams?.err === "booked" ? "That slot is already booked." :
          searchParams?.err === "missing" ? "Please fill name and email." : undefined
        }
        variant={searchParams?.err ? "err" : "ok"}
      />

      <form className="card grid md:grid-cols-4 gap-3" method="get">
        <div className="grid gap-1">
          <label>Search</label>
          <input name="q" defaultValue={q} placeholder="Clinic or provider" />
        </div>
        <div className="grid gap-1">
          <label>Date</label>
          <input type="date" name="date" defaultValue={date} />
        </div>
        <div className="grid gap-1">
          <label>Availability</label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="available" value="1" defaultChecked={availableOnly} />
            Available only
          </label>
        </div>
        <div className="flex items-end gap-2">
          <button className="btn" type="submit">Filter</button>
          <a className="badge" href="/slots">Clear filters</a>
        </div>
        <input type="hidden" name="perPage" value={perPage} />
      </form>

      {slots.length === 0 && <p className="text-gray-500">No slots match your filters.</p>}
      <div className="grid gap-3">
        {slots.map((s) => (
          <div className="card" key={s.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{s.provider?.name} — {s.clinic?.name}</div>
                <div className="text-gray-600">
                  {new Date(s.startsAt).toLocaleString()} ({Math.round(s.durationMin)} min)
                </div>
                <div className="mt-1">
                  <span className="badge">{s.booked ? "Booked" : "Available"}</span>
                </div>
              </div>
              {!s.booked && (
                <BookingForm slotId={s.id} action={bookSlot} />
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} perPage={perPage} total={total} params={{ q, date, available: availableOnly ? "1" : "" }} />
    </div>
  );
}
