import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validateNewPassword } from "@/lib/password-reset";

export async function POST(req: NextRequest) {
  try {
    const { name, companyName, email: rawEmail, phone, requestedService, shortMessage, password } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "נא למלא את כל שדות החובה (שם, אימייל וסיסמה)." },
        { status: 400 }
      );
    }

    const passwordError = validateNewPassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Check if user already exists (case-insensitive: older rows may be mixed-case)
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "כתובת האימייל הזו כבר רשומה במערכת." },
        { status: 400 }
      );
    }

    // Hash password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in PENDING state with CUSTOMER role
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        status: "PENDING",
        companyName,
        phone,
        requestedService,
        shortMessage,
      },
    });

    return NextResponse.json({ success: true, userId: newUser.id }, { status: 201 });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה בעיבוד בקשת ההצטרפות. נא לנסות שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}
