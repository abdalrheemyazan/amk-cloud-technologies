import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    // Security Rule: Only ADMINISTRATOR and SUPPORT_AGENT can view all technicians. CUSTOMER/TECHNICIAN cannot.
    if (role !== "ADMINISTRATOR" && role !== "SUPPORT_AGENT") {
      return NextResponse.json({ error: "Forbidden: Access denied." }, { status: 403 });
    }

    const now = new Date();
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    const technicians = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        presence: {
          select: {
            id: true,
            status: true,
            currentTicketId: true,
            currentSupportSessionId: true,
            lastSeenAt: true,
            updatedAt: true,
          }
        }
      }
    });

    // Stale inactivity detection and dynamic self-healing update
    const processedTechnicians = await Promise.all(
      technicians.map(async (tech) => {
        if (tech.presence) {
          const lastSeen = new Date(tech.presence.lastSeenAt);
          if (tech.presence.status !== "OFFLINE" && (now.getTime() - lastSeen.getTime() > INACTIVITY_TIMEOUT)) {
            const updatedPresence = await prisma.technicianPresence.update({
              where: { id: tech.presence.id },
              data: {
                status: "OFFLINE",
              },
              select: {
                status: true,
                currentTicketId: true,
                currentSupportSessionId: true,
                lastSeenAt: true,
                updatedAt: true,
              }
            });
            return {
              ...tech,
              presence: updatedPresence
            };
          }
        }
        return tech;
      })
    );

    return NextResponse.json({ success: true, technicians: processedTechnicians });
  } catch (error: any) {
    console.error("GET presence error:", error);
    return NextResponse.json(
      { error: "Failed to fetch technician presence information." },
      { status: 500 }
    );
  }
}
