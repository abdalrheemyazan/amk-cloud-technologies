"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES: Role[] = [
  Role.ADMINISTRATOR,
  Role.SUPPORT_AGENT,
  Role.TECHNICIAN,
  Role.TEAM_LEADER,
  Role.CLOUD_ENGINEER,
];

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireStaffUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const role = session.user.role as Role;
  if (!STAFF_ROLES.includes(role)) return null;
  return { id: session.user.id as string, role };
}

export async function addTechnicianNote(content: string): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "EMPTY_NOTE" };

  await prisma.technicianNote.create({
    data: { technicianId: user.id, content: trimmed, isPrivate: true },
  });

  revalidatePath("/support");
  return { ok: true };
}

export async function updateEmailNotifications(enabled: boolean): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  await prisma.user.update({
    where: { id: user.id },
    data: { emailNotifications: enabled },
  });

  revalidatePath("/support");
  return { ok: true };
}
