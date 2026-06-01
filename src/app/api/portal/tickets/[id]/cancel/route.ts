import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    // 2. Authorization check
    if (role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Forbidden: Only customers can cancel their own tickets" },
        { status: 403 }
      );
    }

    // 3. Find ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "קריאה לא נמצאה" }, { status: 404 });
    }

    // 4. Ownership check
    if (ticket.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this ticket" },
        { status: 403 }
      );
    }

    // 5. Read cancellation reason
    const body = await req.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "אנא בחר או הזן את סיבת ביטול הקריאה" },
        { status: 400 }
      );
    }

    // 6. Perform soft cancellation
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason.trim(),
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error: any) {
    console.error("Cancel ticket error:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה בביטול הקריאה. אנא נסה שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}
