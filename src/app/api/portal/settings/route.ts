import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET settings
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
        preferredLanguage: true,
        preferredTheme: true,
        emailNotifications: true,
        monthlyReport: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      settings: {
        preferredLanguage: user.preferredLanguage || "he",
        preferredTheme: user.preferredTheme || "light",
        emailNotifications: user.emailNotifications,
        monthlyReport: user.monthlyReport,
      },
    });
  } catch (error: any) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "אירעה שגיאה בטעינת ההגדרות" }, { status: 500 });
  }
}

// PUT (update) settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { preferredLanguage, preferredTheme, emailNotifications, monthlyReport } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : undefined,
        preferredTheme: preferredTheme !== undefined ? preferredTheme : undefined,
        emailNotifications: emailNotifications !== undefined ? !!emailNotifications : undefined,
        monthlyReport: monthlyReport !== undefined ? !!monthlyReport : undefined,
      },
      select: {
        preferredLanguage: true,
        preferredTheme: true,
        emailNotifications: true,
        monthlyReport: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        preferredLanguage: updatedUser.preferredLanguage || "he",
        preferredTheme: updatedUser.preferredTheme || "light",
        emailNotifications: updatedUser.emailNotifications,
        monthlyReport: updatedUser.monthlyReport,
      },
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "אירעה שגיאה בעדכון ההגדרות" }, { status: 500 });
  }
}
