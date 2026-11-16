import { NextRequest, NextResponse } from "next/server";
import {
  EmailNotConfiguredError,
  clientIp,
  escapeHtml,
  getContactInbox,
  isRateLimited,
  sendEmail,
} from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  company: 160,
  subject: 200,
  message: 5000,
} as const;

type Field = keyof typeof LIMITS;

function readField(body: Record<string, unknown>, field: Field) {
  const value = body[field];
  return typeof value === "string" ? value.trim().slice(0, LIMITS[field]) : "";
}

const UNAVAILABLE_ERROR =
  "לא ניתן לשלוח את הפנייה כרגע. ניתן לפנות אלינו ישירות באימייל או בטלפון.";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ success: true });
  }

  const name = readField(body, "name");
  const email = readField(body, "email").toLowerCase();
  const phone = readField(body, "phone");
  const company = readField(body, "company");
  const subject = readField(body, "subject").replace(/[\r\n]+/g, " ");
  const message = readField(body, "message");

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "נא למלא שם, אימייל, נושא והודעה." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "כתובת האימייל אינה תקינה." }, { status: 400 });
  }

  if (isRateLimited(`contact:${clientIp(req.headers)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "נשלחו יותר מדי פניות. נסו שוב בעוד מספר דקות." },
      { status: 429 },
    );
  }

  const inbox = getContactInbox();
  if (!inbox) {
    console.error("[contact] SMTP / CONTACT_INBOX not configured — message not sent");
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  const rows: Array<[string, string]> = [
    ["שם", name],
    ["אימייל", email],
    ["טלפון", phone || "—"],
    ["חברה", company || "—"],
    ["נושא", subject],
  ];

  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${message}`;
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:14px">
<table cellpadding="4">${rows
    .map(([k, v]) => `<tr><td><b>${escapeHtml(k)}</b></td><td>${escapeHtml(v)}</td></tr>`)
    .join("")}</table>
<p style="white-space:pre-wrap;border-top:1px solid #ddd;padding-top:12px">${escapeHtml(message)}</p>
</div>`;

  try {
    await sendEmail({
      to: inbox,
      replyTo: email,
      subject: `פנייה מהאתר: ${subject}`,
      text,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      console.error("[contact] SMTP not configured — message not sent");
    } else {
      console.error("[contact] failed to send contact email:", error);
    }
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }
}
