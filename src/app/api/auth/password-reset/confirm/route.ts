import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clientIp, isRateLimited } from "@/lib/email";
import {
  consumePasswordResetToken,
  findUserByEmail,
  normalizeEmail,
  validateNewPassword,
} from "@/lib/password-reset";

const INVALID_LINK_ERROR = "הקישור אינו תקף או שפג תוקפו. ניתן לבקש קישור חדש ממסך ההתחברות.";

export async function POST(req: NextRequest) {
  let body: { email?: unknown; token?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה." }, { status: 400 });
  }

  if (isRateLimited(`reset-confirm:${clientIp(req.headers)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "בוצעו יותר מדי ניסיונות. נסו שוב בעוד מספר דקות." },
      { status: 429 },
    );
  }

  const passwordError = validateNewPassword(body.password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const token = typeof body.token === "string" ? body.token.trim() : "";

  try {
    const user = email ? await findUserByEmail(email) : null;
    if (!user || user.status === "REJECTED") {
      return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 });
    }

    const valid = await consumePasswordResetToken(user.email, token);
    if (!valid) {
      return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 });
    }

    const hashed = await bcrypt.hash(body.password as string, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[password-reset] failed to set new password:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה בעדכון הסיסמה. נסו שוב בעוד מספר רגעים." },
      { status: 500 },
    );
  }
}
