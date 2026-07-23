import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const newStatus = action === "approve" ? "ACTIVE" : "REJECTED";

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("User action error:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה בעדכון סטטוס המשתמש." },
      { status: 500 }
    );
  }
}
