function esc(s: string) {
  return String(s || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m] as string));
}

export function bookingCustomerHtml(params: {
  logoCid: string;
  appUrl: string;
  clinicName: string;
  clinicCity: string;
  providerName: string;
  startsAtISO: string;
  durationMin: number;
}) {
  const when = new Date(params.startsAtISO);
  const date = when.toLocaleDateString();
  const time = when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const mapsQuery = encodeURIComponent(`${params.clinicName} ${params.clinicCity}`);
  const mapsUrl = `https://maps.google.com/?q=${mapsQuery}`;
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:24px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#19202A;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #eee;border-radius:16px;padding:24px;">
        <tr>
          <td style="text-align:center;padding-bottom:16px;">
            <img src="cid:${params.logoCid}" alt="CareLux" width="48" height="48" style="display:inline-block;border-radius:12px;">
            <div style="font-weight:700;font-size:18px;margin-top:8px;">CareLux Health</div>
          </td>
        </tr>
        <tr><td>
          <h1 style="font-size:20px;margin:0 0 8px;">Your appointment is confirmed</h1>
          <p style="margin:0 0 16px;color:#4b5563;">Thanks for booking with CareLux. Here are your details:</p>

          <table style="width:100%;font-size:14px;color:#111827;">
            <tr><td style="padding:6px 0;width:160px;color:#6b7280;">Clinic</td><td style="padding:6px 0;font-weight:600;">${esc(params.clinicName)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Provider</td><td style="padding:6px 0;">${esc(params.providerName)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;">${date} at ${time}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Duration</td><td style="padding:6px 0;">${params.durationMin} min</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Address</td><td style="padding:6px 0;"><a style="color:#0b5ed7" href="${mapsUrl}">${esc(params.clinicCity)} (Open in Maps)</a></td></tr>
          </table>

          <div style="text-align:center;margin:20px 0;">
            <a href="${params.appUrl}/slots" style="display:inline-block;background:#B38E5D;color:#fff;text-decoration:none;padding:10px 16px;border-radius:14px;font-weight:600;">View booking</a>
          </div>

          <p style="font-size:12px;color:#6b7280;">If you need to reschedule, reply to this email and our team will help.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

export function bookingAdminHtml(params: {
  logoCid: string;
  appUrl: string;
  clinicName: string;
  clinicCity: string;
  providerName: string;
  startsAtISO: string;
  durationMin: number;
  patientName: string;
  patientEmail: string;
}) {
  const when = new Date(params.startsAtISO);
  const date = when.toLocaleDateString();
  const time = when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:24px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#19202A;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #eee;border-radius:16px;padding:24px;">
        <tr>
          <td style="text-align:center;padding-bottom:16px;">
            <img src="cid:${params.logoCid}" alt="CareLux" width="48" height="48" style="display:inline-block;border-radius:12px;">
            <div style="font-weight:700;font-size:18px;margin-top:8px;">CareLux Health</div>
          </td>
        </tr>
        <tr><td>
          <h1 style="font-size:20px;margin:0 0 8px;">New booking created</h1>
          <p style="margin:0 0 16px;color:#4b5563;">A patient booked an appointment.</p>

          <table style="width:100%;font-size:14px;color:#111827;">
            <tr><td style="padding:6px 0;width:160px;color:#6b7280;">Clinic</td><td style="padding:6px 0;font-weight:600;">${esc(params.clinicName)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Provider</td><td style="padding:6px 0;">${esc(params.providerName)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;">${date} at ${time}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Duration</td><td style="padding:6px 0;">${params.durationMin} min</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Patient</td><td style="padding:6px 0;">${esc(params.patientName)} &lt;${esc(params.patientEmail)}&gt;</td></tr>
          </table>

          <div style="text-align:center;margin:20px 0;">
            <a href="${params.appUrl}/slots" style="display:inline-block;background:#B38E5D;color:#fff;text-decoration:none;padding:10px 16px;border-radius:14px;font-weight:600;">Open dashboard</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}
