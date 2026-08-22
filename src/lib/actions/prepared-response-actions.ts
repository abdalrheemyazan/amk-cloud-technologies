"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Prisma, Role, type PreparedResponseCategory, type ResponseScope } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

function generateErrorId(): string {
  return `ERR-PREP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

function handleServerError(actionName: string, error: unknown): string {
  const errId = generateErrorId();
  console.error(`[prepared-responses][${errId}] ${actionName} failed:`, error);
  return `לא ניתן להשלים את הפעולה כרגע. קוד שגיאה: ${errId}`;
}

async function requireStaffUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !STAFF_ROLES.includes(session.user.role as Role)) return null;
  return {
    id: session.user.id as string,
    role: session.user.role as Role,
    name: session.user.name || "נציג תמיכה",
  };
}

export type PreparedResponseView = {
  id: string;
  title: string;
  category: PreparedResponseCategory;
  content: string;
  scope: ResponseScope;
  isActive: boolean;
  ownerId: string | null;
  ownerName: string | null;
  createdById: string;
  creatorName: string | null;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
};

export async function getPreparedResponses(filters?: {
  scope?: ResponseScope | "ALL";
  category?: PreparedResponseCategory | "ALL";
  search?: string;
  activeOnly?: boolean;
}): Promise<ActionResult<PreparedResponseView[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const isTeamManager = user.role === "ADMINISTRATOR" || user.role === "TEAM_LEADER";
    const andConditions: Prisma.PreparedResponseWhereInput[] = [];

    if (filters?.activeOnly) {
      andConditions.push({ isActive: true });
    }

    if (filters?.category && filters.category !== "ALL") {
      andConditions.push({ category: filters.category });
    }

    if (filters?.scope === "TEAM") {
      andConditions.push({ scope: "TEAM" });
    } else if (filters?.scope === "PERSONAL") {
      andConditions.push({ scope: "PERSONAL", ownerId: user.id });
    } else {
      // Return team responses + own personal responses
      andConditions.push({
        OR: [
          { scope: "TEAM" },
          { scope: "PERSONAL", ownerId: user.id },
        ],
      });
    }

    if (filters?.search?.trim()) {
      const search = filters.search.trim();
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.PreparedResponseWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const items = await prisma.preparedResponse.findMany({
      where,
      include: {
        owner: { select: { name: true, displayName: true } },
        createdBy: { select: { name: true, displayName: true } },
      },
      orderBy: [{ scope: "desc" }, { category: "asc" }, { title: "asc" }],
    });

    const views: PreparedResponseView[] = items.map((item) => {
      const canEdit =
        user.role === "ADMINISTRATOR" ||
        (item.scope === "TEAM" && isTeamManager) ||
        (item.scope === "PERSONAL" && item.ownerId === user.id);

      const canDelete = canEdit;

      return {
        id: item.id,
        title: item.title,
        category: item.category,
        content: item.content,
        scope: item.scope,
        isActive: item.isActive,
        ownerId: item.ownerId,
        ownerName: item.owner ? item.owner.displayName || item.owner.name : null,
        createdById: item.createdById,
        creatorName: item.createdBy ? item.createdBy.displayName || item.createdBy.name : null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        canEdit,
        canDelete,
      };
    });

    return { ok: true, data: views };
  } catch (error) {
    const errorMsg = handleServerError("getPreparedResponses", error);
    return { ok: false, error: errorMsg };
  }
}

export async function createPreparedResponse(input: {
  title: string;
  category: PreparedResponseCategory;
  content: string;
  scope: ResponseScope;
}): Promise<ActionResult<PreparedResponseView>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const title = input.title.trim();
  const content = input.content.trim();
  if (!title || !content) {
    return { ok: false, error: "נא למלא כותרת ותוכן לתגובה המוכנה." };
  }

  const isTeamManager = user.role === "ADMINISTRATOR" || user.role === "TEAM_LEADER";
  let targetScope = input.scope;

  if (targetScope === "TEAM" && !isTeamManager) {
    targetScope = "PERSONAL"; // Support agents can only create PERSONAL templates
  }

  try {
    const created = await prisma.preparedResponse.create({
      data: {
        title,
        category: input.category,
        content,
        scope: targetScope,
        ownerId: targetScope === "PERSONAL" ? user.id : null,
        createdById: user.id,
        isActive: true,
      },
      include: {
        owner: { select: { name: true, displayName: true } },
        createdBy: { select: { name: true, displayName: true } },
      },
    });

    revalidatePath("/support/agent");

    return {
      ok: true,
      data: {
        id: created.id,
        title: created.title,
        category: created.category,
        content: created.content,
        scope: created.scope,
        isActive: created.isActive,
        ownerId: created.ownerId,
        ownerName: created.owner ? created.owner.displayName || created.owner.name : null,
        createdById: created.createdById,
        creatorName: created.createdBy ? created.createdBy.displayName || created.createdBy.name : null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        canEdit: true,
        canDelete: true,
      },
    };
  } catch (error) {
    const errorMsg = handleServerError("createPreparedResponse", error);
    return { ok: false, error: errorMsg };
  }
}

export async function updatePreparedResponse(
  id: string,
  input: {
    title?: string;
    category?: PreparedResponseCategory;
    content?: string;
    isActive?: boolean;
    scope?: ResponseScope;
  }
): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const existing = await prisma.preparedResponse.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "התגובה המוכנה לא נמצאה." };

    const isTeamManager = user.role === "ADMINISTRATOR" || user.role === "TEAM_LEADER";
    const canEdit =
      user.role === "ADMINISTRATOR" ||
      (existing.scope === "TEAM" && isTeamManager) ||
      (existing.scope === "PERSONAL" && existing.ownerId === user.id);

    if (!canEdit) {
      return { ok: false, error: "אין לך הרשאה לערוך תגובה זו." };
    }

    const dataToUpdate: Record<string, unknown> = {
      updatedById: user.id,
    };

    if (input.title !== undefined) {
      const trimmedTitle = input.title.trim();
      if (!trimmedTitle) return { ok: false, error: "כותרת לא יכולה להיות ריקה." };
      dataToUpdate.title = trimmedTitle;
    }

    if (input.content !== undefined) {
      const trimmedContent = input.content.trim();
      if (!trimmedContent) return { ok: false, error: "תוכן התגובה לא יכול להיות ריק." };
      dataToUpdate.content = trimmedContent;
    }

    if (input.category !== undefined) {
      dataToUpdate.category = input.category;
    }

    if (input.isActive !== undefined) {
      dataToUpdate.isActive = input.isActive;
    }

    if (input.scope !== undefined && isTeamManager) {
      dataToUpdate.scope = input.scope;
      dataToUpdate.ownerId = input.scope === "PERSONAL" ? (existing.ownerId || user.id) : null;
    }

    await prisma.preparedResponse.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/support/agent");
    return { ok: true };
  } catch (error) {
    const errorMsg = handleServerError("updatePreparedResponse", error);
    return { ok: false, error: errorMsg };
  }
}

export async function deletePreparedResponse(id: string): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const existing = await prisma.preparedResponse.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "התגובה המוכנה לא נמצאה." };

    const isTeamManager = user.role === "ADMINISTRATOR" || user.role === "TEAM_LEADER";
    const canDelete =
      user.role === "ADMINISTRATOR" ||
      (existing.scope === "TEAM" && isTeamManager) ||
      (existing.scope === "PERSONAL" && existing.ownerId === user.id);

    if (!canDelete) {
      return { ok: false, error: "אין לך הרשאה למחוק תגובה זו." };
    }

    await prisma.preparedResponse.delete({ where: { id } });

    revalidatePath("/support/agent");
    return { ok: true };
  } catch (error) {
    const errorMsg = handleServerError("deletePreparedResponse", error);
    return { ok: false, error: errorMsg };
  }
}

export async function duplicatePreparedResponse(id: string): Promise<ActionResult<PreparedResponseView>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const existing = await prisma.preparedResponse.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "התגובה המוכנה לא נמצאה." };

    const cloned = await prisma.preparedResponse.create({
      data: {
        title: `${existing.title} (העתק)`,
        category: existing.category,
        content: existing.content,
        scope: "PERSONAL",
        ownerId: user.id,
        createdById: user.id,
        isActive: true,
      },
      include: {
        owner: { select: { name: true, displayName: true } },
        createdBy: { select: { name: true, displayName: true } },
      },
    });

    revalidatePath("/support/agent");

    return {
      ok: true,
      data: {
        id: cloned.id,
        title: cloned.title,
        category: cloned.category,
        content: cloned.content,
        scope: cloned.scope,
        isActive: cloned.isActive,
        ownerId: cloned.ownerId,
        ownerName: cloned.owner ? cloned.owner.displayName || cloned.owner.name : null,
        createdById: cloned.createdById,
        creatorName: cloned.createdBy ? cloned.createdBy.displayName || cloned.createdBy.name : null,
        createdAt: cloned.createdAt.toISOString(),
        updatedAt: cloned.updatedAt.toISOString(),
        canEdit: true,
        canDelete: true,
      },
    };
  } catch (error) {
    const errorMsg = handleServerError("duplicatePreparedResponse", error);
    return { ok: false, error: errorMsg };
  }
}
