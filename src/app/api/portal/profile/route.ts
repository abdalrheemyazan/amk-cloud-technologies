import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET current profile data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: user });
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "אירעה שגיאה בטעינת פרטי הפרופיל" }, { status: 500 });
  }
}

// PUT (update) profile data
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, phone, companyName } = body;

    // Secure updates - only name, phone, and companyName are allowed to be modified.
    // email and role can NOT be modified by the CUSTOMER role.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        companyName: companyName !== undefined ? companyName.trim() : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, profile: updatedUser });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "לא הצלחנו לעדכן את פרטי הפרופיל. נסה שוב בעוד רגע" }, { status: 500 });
  }
}
