import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmail } from "../../../lib/mailer";
import { bookingCustomerHtml, bookingAdminHtml } from "../../../lib/emailTemplates";
import BookingForm from "../../../components/BookingForm";
import Breadcrumbs from "../../../components/Breadcrumbs";
import BackButton from "../../../components/BackButton";
import { createCalendarEvent } from "../../../lib/calendar";

// UPDATED: The bookSlot server action
async function bookSlot(formData: FormData) {
  "use server";
  const slotId = String(formData.get("slotId") || "");
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const notes = String(formData.get("notes") || "");

  if (!slotId || !name || !email) redirect(`/clinics?err=missing`);

  try {
    await prisma.booking.create({
      data: { slotId, patientName: name, patientEmail: email, notes: notes || null },
    });
    await prisma.slot.update({ where: { id: slotId }, data: { booked: true } });

    // UPDATED: Fetch service along with slot
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { clinic: true, provider: true, service: true },
    });

    if (slot && slot.service) {
      const startsAt = new Date(slot.startsAt);
      // UPDATED: Use duration from service
      const endsAt = new Date(startsAt.getTime() + slot.service.durationMin * 60000);
      const event = await createCalendarEvent({
        title: `Appointment: ${slot.service.name} with ${slot.provider.name}`,
        description: `Your confirmed booking for ${slot.service.name}. Notes: ${notes || "None"}`,
        location: `${slot.clinic.name}, ${slot.clinic.city}`,
        start: [startsAt.getFullYear(), startsAt.getMonth() + 1, startsAt.getDate(), startsAt.getHours(), startsAt.getMinutes()],
        end: [endsAt.getFullYear(), endsAt.getMonth() + 1, endsAt.getDate(), endsAt.getHours(), endsAt.getMinutes()],
        status: 'CONFIRMED',
        organizer: { name: "CareLux Health", email: process.env.SMTP_FROM || 'noreply@carelux.app' },
        attendees: [
          { name: name, email: email, rsvp: true, partstat: 'NEEDS-ACTION', role: 'REQ-PARTICIPANT' }
        ]
      });

      const attachments = [{
        filename: 'invite.ics',
        content: event,
        contentType: 'text/calendar; method=REQUEST',
      }];

      const appUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
      const customerHtml = bookingCustomerHtml({
        logoCid: "logo",
        clinicName: slot.clinic.name,
        clinicCity: slot.clinic.city,
        providerName: slot.provider.name,
        startsAtISO: slot.startsAt.toISOString(),
        durationMin: slot.service.durationMin, // UPDATED
        appUrl,
      });
      const adminHtml = bookingAdminHtml({
        logoCid: "logo",
        clinicName: slot.clinic.name,
        clinicCity: slot.clinic.city,
        providerName: slot.provider.name,
        startsAtISO: slot.startsAt.toISOString(),
        durationMin: slot.service.durationMin, // UPDATED
        patientName: name,
        patientEmail: email,
        appUrl,
      });

      const adminEmailAddr = process.env.ADMIN_EMAIL || process.env.SMTP_USER || '';
      try {
        if (email) await sendEmail({ to: email, subject: 'Your CareLux booking is confirmed', html: customerHtml, attachments });
        if (adminEmailAddr) await sendEmail({ to: adminEmailAddr, subject: 'New CareLux booking', html: adminHtml });
      } catch (e) {
        console.warn('[booking] Email send failed', e);
      }
    }
  } catch(e) {
    console.error("Booking failed:", e);
    redirect(`/clinics?err=booked`);
  }

  revalidatePath(`/clinics`);
}

// UPDATED: The main page component
export default async function ClinicDetail({ params }: { params: { id: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: params.id },
    include: {
      clinicSpecialties: { include: { specialty: true } },
      providers: true,
      // UPDATED: Include service when fetching slots
      slots: { include: { provider: true, service: true }, orderBy: { startsAt: "asc" } },
    },
  });
  if (!clinic) return notFound();

  const specialties = clinic.clinicSpecialties.map(cs => cs.specialty?.name).filter(Boolean) as string[];

  return (
    <div className="grid gap-4">
      <Breadcrumbs items={[{ label: "Clinics", href: "/clinics" }, { label: clinic.name }]} />
      <div className="flex items-center justify-between">
        <BackButton />
      </div>
      <div className="card">
        <h1 className="text-2xl font-semibold">{clinic.name}</h1>
        <p className="text-gray-600">{clinic.city}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {specialties.map(s => <span className="badge" key={s}>{s}</span>)}
        </div>
      </div>

      <div className="grid gap-3">
        <h2 className="text-xl font-semibold">Providers</h2>
        {clinic.providers.length === 0 && <p className="text-gray-500">No providers yet.</p>}
        {clinic.providers.map(p => (
          <div className="card" key={p.id}>
            <div className="font-medium">{p.name}</div>
            <div className="text-gray-600">{p.specialty}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <h2 className="text-xl font-semibold">Slots</h2>
        {clinic.slots.length === 0 && <p className="text-gray-500">No slots yet.</p>}
        {clinic.slots.map(s => (
          <div className="card" key={s.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                {/* UPDATED: Display service name and duration */}
                <div className="font-medium">{s.service?.name} with {s.provider?.name}</div>
                <div className="text-gray-600">
                  {new Date(s.startsAt).toLocaleString()} ({s.service?.durationMin} min)
                </div>
                <div className="mt-1">
                  <span className="badge">{s.booked ? "Booked" : "Available"}</span>
                </div>
              </div>
              {!s.booked && <BookingForm slotId={s.id} action={bookSlot} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
