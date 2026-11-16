import { NextRequest, NextResponse } from "next/server";
import {
  EmailNotConfiguredError,
  clientIp,
  escapeHtml,
  isEmailConfigured,
  isRateLimited,
  sendEmail,
} from "@/lib/email";
import {
  createPasswordResetToken,
  findUserByEmail,
  normalizeEmail,
} from "@/lib/password-reset";

const UNAVAILABLE_ERROR =
  "איפוס סיסמה אינו זמין כרגע. ניתן לפנות לתמיכה כדי לקבל עזרה בגישה לחשבון.";

// Same answer whether or not the email exists, so the form can't be used to
// find out who has an account.
function genericOk() {
  return NextResponse.json({ success: true });
}

function appBaseUrl(req: NextRequest) {
  // Prefer the configured URL: building links from the request Host header
  // would let an attacker point reset emails at their own domain.
  const configured = process.env.NEXTAUTH_URL?.trim() || process.env.APP_URL?.trim();
  return (configured || req.nextUrl.origin).replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email || email.length > 200 || !email.includes("@")) {
    return NextResponse.json({ error: "נא להזין כתובת אימייל תקינה." }, { status: 400 });
  }

  if (isRateLimited(`reset:${clientIp(req.headers)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "בוצעו יותר מדי ניסיונות. נסו שוב בעוד מספר דקות." },
      { status: 429 },
    );
  }

  if (!isEmailConfigured()) {
    console.error("[password-reset] SMTP not configured — cannot send reset links");
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || user.status === "REJECTED") return genericOk();

    const token = await createPasswordResetToken(user.email);
    if (!token) return genericOk(); // a link was sent less than a minute ago

    const link =
      `${appBaseUrl(req)}/reset-password?token=${encodeURIComponent(token)}` +
      `&email=${encodeURIComponent(user.email)}`;
    const greetingName = user.displayName?.trim() || user.name?.trim() || "";

    await sendEmail({
      to: user.email,
      subject: "איפוס סיסמה – AMK Cloud Technologies",
      text:
        `שלום ${greetingName},\n\n` +
        `התקבלה בקשה לאיפוס הסיסמה לחשבון שלך ב-AMK.\n` +
        `לבחירת סיסמה חדשה יש להיכנס לקישור הבא (תקף לשעה אחת):\n${link}\n\n` +
        `אם לא ביקשת לאפס את הסיסמה, אפשר להתעלם מהודעה זו.`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">
<p>שלום ${escapeHtml(greetingName)},</p>
<p>התקבלה בקשה לאיפוס הסיסמה לחשבון שלך ב-AMK.</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold">בחירת סיסמה חדשה</a></p>
<p style="color:#64748b;font-size:13px">הקישור תקף לשעה אחת ולשימוש חד-פעמי. אם לא ביקשת לאפס את הסיסמה, אפשר להתעלם מהודעה זו.</p>
</div>`,
    });

    return genericOk();
  } catch (error) {
    if (!(error instanceof EmailNotConfiguredError)) {
      console.error("[password-reset] failed to issue reset link:", error);
    }
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }
}
