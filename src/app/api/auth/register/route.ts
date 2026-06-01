import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, companyName, email, phone, requestedService, shortMessage, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "נא למלא את כל שדות החובה (שם, אימייל וסיסמה)." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
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
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה בעיבוד בקשת ההצטרפות. נא לנסות שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}
