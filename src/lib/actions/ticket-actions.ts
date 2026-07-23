"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Role, TicketStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireStaffUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const role = session.user.role as Role;
  if (!STAFF_ROLES.includes(role)) return null;
  return { id: session.user.id as string, role };
}

export async function startTicketTreatment(ticketId: string): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false, error: "NOT_FOUND" };
  if (ticket.agentId && ticket.agentId !== user.id) return { ok: false, error: "ASSIGNED_TO_OTHER" };

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: TicketStatus.IN_PROGRESS, agentId: ticket.agentId ?? user.id },
  });

  revalidatePath("/support");
  return { ok: true };
}

export async function completeTicketTreatment(ticketId: string): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false, error: "NOT_FOUND" };
  if (ticket.agentId !== user.id) return { ok: false, error: "NOT_OWNER" };

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: TicketStatus.RESOLVED },
  });

  revalidatePath("/support");
  return { ok: true };
}

export async function addTicketMessage(ticketId: string, message: string): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const trimmed = message.trim();
  if (!trimmed) return { ok: false, error: "EMPTY_MESSAGE" };

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false, error: "NOT_FOUND" };
  if (ticket.agentId !== user.id) return { ok: false, error: "NOT_OWNER" };

  await prisma.ticketMessage.create({
    data: { ticketId, senderId: user.id, message: trimmed },
  });

  revalidatePath("/support");
  return { ok: true };
}
