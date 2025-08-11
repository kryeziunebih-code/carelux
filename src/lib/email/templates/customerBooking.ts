import { emailLayout } from "./layout";

export function renderCustomerBookingEmail(data: {
  customerName: string;
  bookingId: string;
  serviceName: string;
  providerName?: string | null;
  dateISO: string;
  location: string;
  priceCHF?: number;
  manageUrl: string;
  supportEmail?: string;
}) {
  const dt = new Date(data.dateISO);
  const when = dt.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <div class="title">Booking confirmed 🎉</div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Thanks for choosing <strong>CareLux</strong>. Your booking is confirmed.</p>

      <div class="info">
        <div><span class="pill">Booking #${data.bookingId}</span></div>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        ${data.providerName ? `<p><strong>Professional:</strong> ${data.providerName}</p>` : ""}
        <p><strong>When:</strong> ${when}</p>
        <p><strong>Where:</strong> ${data.location}</p>
        ${typeof data.priceCHF === "number" ? `<p><strong>Total:</strong> CHF ${data.priceCHF.toFixed(2)}</p>` : ""}
      </div>

      <p>
        You can manage your booking anytime:
      </p>
      <p>
        <a class="btn btn-primary" href="${data.manageUrl}" target="_blank" rel="noopener">View / Reschedule / Cancel</a>
      </p>

      <p class="muted">
        Need help? ${data.supportEmail ? `Reply to this email or write us at ${data.supportEmail}.` : "Just reply to this email."}
      </p>
    </div>
  `;

  const html = emailLayout({
    title: "Your CareLux booking is confirmed",
    preview: "Your booking is confirmed. View details inside.",
    content,
  });

  const text = [
    "Booking confirmed",
    "",
    `Booking #${data.bookingId}`,
    `Service: ${data.serviceName}`,
    data.providerName ? `Professional: ${data.providerName}` : "",
    `When: ${when}`,
    `Where: ${data.location}`,
    typeof data.priceCHF === "number" ? `Total: CHF ${data.priceCHF.toFixed(2)}` : "",
    "",
    `Manage: ${data.manageUrl}`,
  ].filter(Boolean).join("\n");

  return { html, text };
}
