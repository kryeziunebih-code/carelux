import nodemailer from "nodemailer";

const {
  SMTP_HOST = "smtp.gmail.com",
  SMTP_PORT = "465",
  SMTP_SECURE = "true",
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM = "CareLux <no-reply@carelux.app>",
} = process.env;

if (!SMTP_USER || !SMTP_PASS) {
  console.warn("[mailer] Missing SMTP_USER/SMTP_PASS envs");
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE === "true",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}) {
  return transporter.sendMail({
    from: MAIL_FROM,
    ...opts,
  });
}
