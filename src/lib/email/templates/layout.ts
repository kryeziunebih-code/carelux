export function emailLayout({
  title,
  preview,
  content,
}: {
  title: string;
  preview?: string;
  content: string;
}) {
  const logoUrl =
    process.env.EMAIL_LOGO_URL ||
    "https://cdn.carelux.app/brand/carelux-logo.png";

  const previewSpan = preview
    ? `<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;visibility:hidden;mso-hide:all;">${preview}</span>`
    : "";

  return `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>${title}</title>
<style>
  body{margin:0;padding:0;background:#f6f7fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827}
  a{color:#0ea5e9;text-decoration:none}
  .container{max-width:640px;margin:0 auto;padding:24px}
  .card{background:#ffffff;border-radius:16px;box-shadow:0 2px 10px rgba(17,24,39,0.06);overflow:hidden}
  .header{padding:24px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:12px}
  .brand{display:flex;align-items:center;gap:12px}
  .brand img{height:28px}
  .brand-name{font-weight:700;font-size:18px;color:#0f172a;letter-spacing:0.2px}
  .title{padding:24px 24px 0 24px;font-size:20px;font-weight:700;color:#0f172a}
  .content{padding:16px 24px 24px 24px;line-height:1.6}
  .pill{display:inline-block;background:#ecfeff;color:#155e75;border:1px solid #a5f3fc;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600}
  .info{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;margin:12px 0}
  .btn{display:inline-block;padding:12px 18px;border-radius:10px;font-weight:700;border:1px solid #0ea5e9}
  .btn-primary{background:#0ea5e9;color:white}
  .muted{color:#6b7280;font-size:12px}
  .footer{padding:16px 8px;text-align:center;color:#6b7280;font-size:12px}
  @media (max-width: 480px){
    .container{padding:12px}
    .title{font-size:18px}
  }
</style>
</head>
<body>
${previewSpan}
<div class="container">
  <div class="card">
    <div class="header">
      <div class="brand">
        <img src="${logoUrl}" alt="CareLux" />
        <div class="brand-name">CareLux</div>
      </div>
    </div>
    ${content}
    <div class="footer">
      You received this email because you booked with CareLux.<br />
      © ${new Date().getFullYear()} CareLux — All rights reserved.
    </div>
  </div>
</div>
</body>
</html>`;
}
