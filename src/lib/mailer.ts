import nodemailer from "nodemailer";

export function getTransport() {
  console.log('[mailer] Initializing transport...');
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[mailer] Missing SMTP env', { host, user, hasPass: Boolean(pass) });
    console.warn("[mailer] Missing SMTP env; emails will be skipped.");
    return null as any;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  console.log('[mailer] Transport ready:', { host, port, secure: port === 465 });
  return transporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}) {
  const transporter = getTransport();
  console.log('[mailer] Sending email to', opts.to, 'subject:', opts.subject);
  if (!transporter) return false;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments || []
  });
  console.log('[mailer] Email sent OK:', info && (info.messageId || info.response));
  return info;
}
