import { emailLayout } from "./layout";

export function renderAdminBookingEmail(data: {
  bookingId: string;
  createdISO: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  serviceName: string;
  providerName?: string | null;
  dateISO: string;
  location: string;
  priceCHF?: number;
  notes?: string | null;
  dashboardUrl: string;
}) {
  const created = new Date(data.createdISO).toLocaleString("en-GB");
  const when = new Date(data.dateISO).toLocaleString("en-GB");

  const content = `
    <div class="title">New booking received</div>
    <div class="content">
      <div class="info">
        <div><span class="pill">Booking #${data.bookingId}</span></div>
        <p><strong>Created:</strong> ${created}</p>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        ${data.providerName ? `<p><strong>Professional:</strong> ${data.providerName}</p>` : ""}
        <p><strong>Scheduled for:</strong> ${when}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        ${typeof data.priceCHF === "number" ? `<p><strong>Total (CHF):</strong> ${data.priceCHF.toFixed(2)}</p>` : ""}
      </div>

      <h4>Customer</h4>
      <div class="info">
        <p><strong>Name:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
        ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ""}
      </div>

      ${
        data.notes
          ? `<h4>Notes</h4><div class="info"><p>${escapeHtml(data.notes)}</p></div>`
          : ""
      }

      <p>
        <a class="btn" href="${data.dashboardUrl}" target="_blank" rel="noopener">Open in dashboard</a>
      </p>
    </div>
  `;

  const html = emailLayout({
    title: "New CareLux booking",
    preview: `New booking #${data.bookingId} received.`,
    content,
  });

  const text = [
    "New booking received",
    `Booking #${data.bookingId}`,
    `Created: ${created}`,
    `Service: ${data.serviceName}`,
    data.providerName ? `Professional: ${data.providerName}` : "",
    `Scheduled for: ${when}`,
    `Location: ${data.location}`,
    typeof data.priceCHF === "number" ? `Total (CHF): ${data.priceCHF.toFixed(2)}` : "",
    "",
    `Customer: ${data.customerName}`,
    `Email: ${data.customerEmail}`,
    data.customerPhone ? `Phone: ${data.customerPhone}` : "",
    data.notes ? `Notes: ${data.notes}` : "",
    "",
    `Dashboard: ${data.dashboardUrl}`,
  ].filter(Boolean).join("\n");

  return { html, text };
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]!));
}
