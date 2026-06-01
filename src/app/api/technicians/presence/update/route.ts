import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Security Rule: Only TECHNICIAN can update their own status.
    if (role !== "TECHNICIAN") {
      return NextResponse.json({ error: "Forbidden: Only technicians can update status." }, { status: 403 });
    }

    const { status, currentTicketId, currentSupportSessionId } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Missing required fields: status" }, { status: 400 });
    }

    // Valid statuses from PresenceStatus enum
    const validStatuses = ["ONLINE", "OFFLINE", "BUSY", "IN_TICKET", "IN_REMOTE_SESSION", "AVAILABLE"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    // Upsert status for current logged-in technician
    const presence = await prisma.technicianPresence.upsert({
      where: { technicianId: userId },
      update: {
        status: status as any,
        currentTicketId: currentTicketId || null,
        currentSupportSessionId: currentSupportSessionId || null,
        lastSeenAt: new Date(),
      },
      create: {
        technicianId: userId,
        status: status as any,
        currentTicketId: currentTicketId || null,
        currentSupportSessionId: currentSupportSessionId || null,
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, presence });
  } catch (error: any) {
    console.error("POST presence update error:", error);
    return NextResponse.json(
      { error: "Failed to update presence status." },
      { status: 500 }
    );
  }
}
