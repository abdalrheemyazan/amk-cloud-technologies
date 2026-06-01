import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const INTERNAL_ROLES = [
  "ADMINISTRATOR",
  "SUPPORT_AGENT",
  "TECHNICIAN",
  "TEAM_LEADER",
  "CLOUD_ENGINEER",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!INTERNAL_ROLES.includes(role)) {
      return NextResponse.json({ error: "אין הרשאות גישה" }, { status: 403 });
    }

    const ticketId = (await params).id;
    if (!ticketId) {
      return NextResponse.json({ error: "מזהה קריאה חסר" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "סטטוס לא תקין" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "קריאה לא נמצאה" }, { status: 404 });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה פנימית" },
      { status: 500 }
    );
  }
}
