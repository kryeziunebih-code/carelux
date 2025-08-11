import { sendMail } from "../email/mailer";
import { renderCustomerBookingEmail } from "../email/templates/customerBooking";
import { renderAdminBookingEmail } from "../email/templates/adminBooking";

const { ADMIN_EMAIL = "" } = process.env;

export async function sendBookingEmails(params: {
  bookingId: string;
  createdISO: string;
  customer: { name: string; email: string; phone?: string | null };
  serviceName: string;
  providerName?: string | null;
  dateISO: string;
  location: string;
  priceCHF?: number;
  notes?: string | null;
  manageUrl: string;
  dashboardUrl: string;
  supportEmail?: string;
}) {
  const customerEmail = renderCustomerBookingEmail({
    customerName: params.customer.name,
    bookingId: params.bookingId,
    serviceName: params.serviceName,
    providerName: params.providerName,
    dateISO: params.dateISO,
    location: params.location,
    priceCHF: params.priceCHF,
    manageUrl: params.manageUrl,
    supportEmail: params.supportEmail,
  });

  const adminEmail = renderAdminBookingEmail({
    bookingId: params.bookingId,
    createdISO: params.createdISO,
    customerName: params.customer.name,
    customerEmail: params.customer.email,
    customerPhone: params.customer.phone,
    serviceName: params.serviceName,
    providerName: params.providerName,
    dateISO: params.dateISO,
    location: params.location,
    priceCHF: params.priceCHF,
    notes: params.notes,
    dashboardUrl: params.dashboardUrl,
  });

  await sendMail({
    to: params.customer.email,
    subject: "Your CareLux booking is confirmed",
    html: customerEmail.html,
    text: customerEmail.text,
    replyTo: params.supportEmail,
  });

  if (ADMIN_EMAIL) {
    await sendMail({
      to: ADMIN_EMAIL,
      subject: `New booking #${params.bookingId}`,
      html: adminEmail.html,
      text: adminEmail.text,
    });
  }
}
