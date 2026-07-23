"use server";

import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";
import { normalizeAgentStatus, type AgentStatus } from "@/lib/support-types";
import { ROLE_LABELS } from "@/lib/support-labels";
import { recomputePresenceAfterSessionGain, recomputePresenceAfterSessionLoss } from "@/lib/presence";
import {
  discardStagedSupportAttachments,
  legacySupportAttachmentViews,
  stageSupportAttachments,
  storedSupportAttachmentView,
  supportAttachmentCreateData,
  supportAttachmentExpiry,
  validateSupportAttachments,
  type PreparedSupportAttachment,
  type SupportAttachmentUpload,
  type SupportAttachmentView,
} from "@/lib/support-attachments";
import { removeSupportAttachmentObjects } from "@/lib/support-attachment-storage";
import { URGENCY_LABELS, type RequestUrgency } from "@/lib/support-request-options";

const GENERIC_ERROR = "לא ניתן לטעון את הנתונים כרגע. נסה שוב בעוד מספר רגעים.";
const UPLOAD_ERROR = "לא ניתן להעלות את התמונה כרגע. נסה שוב בעוד מספר רגעים.";
const SESSION_TTL_DAYS = 7;
const CLEANUP_MIN_INTERVAL_MS = 60_000;
let lastCleanupAt = 0;
export type ChatAttachment = SupportAttachmentView;

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return { id: session.user.id as string, role: session.user.role as Role };
}

async function requireStaffUser() {
  const user = await requireUser();
  if (!user || !STAFF_ROLES.includes(user.role)) return null;
  return user;
}

function canAccessSession(session: { technicianId: string | null }, user: { id: string; role: Role }) {
  return session.technicianId === user.id || user.role === "ADMINISTRATOR";
}

export async function cleanupExpiredSupportSessions() {
  const cleanupStartedAt = Date.now();
  if (cleanupStartedAt - lastCleanupAt < CLEANUP_MIN_INTERVAL_MS) return;
  lastCleanupAt = cleanupStartedAt;

  const now = new Date();
  const internalMessageCutoff = new Date(now.getTime() - SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const expired = await prisma.supportSession.findMany({
    where: {
      status: { in: ["PENDING", "ACTIVE", "AI_CHAT"] },
      expiresAt: { lt: now },
    },
    select: { id: true, status: true },
  });
  const expiredIds = expired.map((s) => s.id);
  const expiredAiIds = expired.filter((session) => session.status === "AI_CHAT").map((session) => session.id);
  const expiredSupportIds = expired.filter((session) => session.status !== "AI_CHAT").map((session) => session.id);
  const expiredAttachments = await prisma.supportAttachment.findMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        ...(expiredIds.length > 0 ? [{ sessionId: { in: expiredIds } }] : []),
      ],
    },
    select: { storagePath: true, storageProvider: true },
  });

  await removeSupportAttachmentObjects(expiredAttachments).catch((error) => {
    console.error("Failed to remove expired support attachments from storage:", error);
  });

  await prisma.$transaction(async (tx) => {
    if (expiredSupportIds.length > 0) {
      await tx.supportSession.updateMany({
        where: { id: { in: expiredSupportIds } },
        data: { status: "EXPIRED" },
      });
      await tx.sessionMessage.deleteMany({ where: { sessionId: { in: expiredSupportIds } } });
    }
    if (expiredAiIds.length > 0) {
      await tx.supportSession.deleteMany({ where: { id: { in: expiredAiIds } } });
    }

    await tx.internalSupportMessage.deleteMany({
      where: { createdAt: { lt: internalMessageCutoff } },
    });
    await tx.supportAttachment.deleteMany({ where: { expiresAt: { lt: now } } });
    await tx.internalChatClearState.deleteMany({ where: { clearedAt: { lt: internalMessageCutoff } } });
  });
}

async function createSessionMessageWithAttachments({
  attachments,
  message,
  senderId,
  senderRole,
  sessionId,
}: {
  attachments: PreparedSupportAttachment[];
  message: string;
  senderId: string;
  senderRole: Role;
  sessionId: string;
}) {
  const messageId = randomUUID();
  const staged = await stageSupportAttachments({
    attachments,
    messageId,
    scope: sessionId,
  });

  try {
    await prisma.sessionMessage.create({
      data: {
        id: messageId,
        sessionId,
        senderId,
        senderRole,
        message,
        files:
          staged.length > 0
            ? {
                create: staged.map((attachment) =>
                  supportAttachmentCreateData(attachment, {
                    expiresAt: supportAttachmentExpiry(),
                    sessionId,
                    uploadedById: senderId,
                  }),
                ),
              }
            : undefined,
      },
    });
  } catch (error) {
    await discardStagedSupportAttachments(staged).catch((cleanupError) => {
      console.error("Failed to roll back support message attachments:", cleanupError);
    });
    throw error;
  }
}

async function expireStaleSessions() {
  await cleanupExpiredSupportSessions();
}

// ---------- Customer side ----------

export async function getSupportAvailability(): Promise<ActionResult<{ available: boolean }>> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const availableAgent = await prisma.technicianPresence.findFirst({
      where: { status: "AVAILABLE" },
    });
    return { ok: true, data: { available: !!availableAgent } };
  } catch (error) {
    console.error("getSupportAvailability failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type MyRequestSummary = {
  id: string;
  subject: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

export type MyPortalSummary = {
  openRequestsCount: number;
  recentRequests: MyRequestSummary[];
  supportAvailable: boolean;
};

export async function getMyPortalSummary(): Promise<ActionResult<MyPortalSummary>> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const [openRequestsCount, recentSessions, availableAgent] = await Promise.all([
      prisma.supportSession.count({
        where: { customerId: user.id, status: { in: ["PENDING", "ACTIVE"] } },
      }),
      prisma.supportSession.findMany({
        where: { customerId: user.id, status: { not: "AI_CHAT" }, customerDeletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.technicianPresence.findFirst({ where: { status: "AVAILABLE" } }),
    ]);

    return {
      ok: true,
      data: {
        openRequestsCount,
        recentRequests: recentSessions.map((s) => ({
          id: s.id,
          subject: s.subject,
          category: s.category,
          status: s.status,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
          closedAt: s.closedAt?.toISOString() ?? null,
        })),
        supportAvailable: !!availableAgent,
      },
    };
  } catch (error) {
    console.error("getMyPortalSummary failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function requestAgentChat(
  category: string,
  summary: string
): Promise<ActionResult<{ sessionId: string; agentAvailable: boolean }>> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const availableAgent = await prisma.technicianPresence.findFirst({
      where: { status: "AVAILABLE" },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    const chatSession = await prisma.supportSession.create({
      data: {
        customerId: user.id,
        status: "PENDING",
        category,
        summary: summary.trim().slice(0, 2000),
        expiresAt,
        publicActivities: {
          create: {
            type: "REQUEST_RECEIVED",
            message: "הבקשה שלך התקבלה",
          },
        },
      },
    });

    revalidatePath("/support/agent");
    return { ok: true, data: { sessionId: chatSession.id, agentAvailable: !!availableAgent } };
  } catch (error) {
    console.error("requestAgentChat failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type SupportRequestInput = {
  title: string;
  description: string;
  relatedService?: string;
  urgency: RequestUrgency;
  os?: string;
  browser?: string;
  device?: string;
  attachments?: SupportAttachmentUpload[];
};

const MISSING_FIELDS_ERROR = "יש למלא כותרת ותיאור לפנייה.";

export async function submitSupportRequest(
  input: SupportRequestInput
): Promise<ActionResult<{ sessionId: string; agentAvailable: boolean }>> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const title = input.title.trim().slice(0, 200);
  const description = input.description.trim().slice(0, 4000);
  if (!title || !description) return { ok: false, error: MISSING_FIELDS_ERROR };

  const validated = validateSupportAttachments(input.attachments);
  if (!validated.ok) return { ok: false, error: validated.error };

  try {
    const availableAgent = await prisma.technicianPresence.findFirst({
      where: { status: "AVAILABLE" },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    const detailLines = [
      `רמת דחיפות: ${URGENCY_LABELS[input.urgency]}`,
      input.os?.trim() && `מערכת הפעלה: ${input.os.trim()}`,
      input.browser?.trim() && `דפדפן: ${input.browser.trim()}`,
      input.device?.trim() && `מכשיר: ${input.device.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
    const composedMessage = [description, detailLines].filter(Boolean).join("\n\n");
    const relatedService = input.relatedService?.trim().slice(0, 80) || null;

    const chatSession = await prisma.supportSession.create({
      data: {
        customerId: user.id,
        status: "PENDING",
        category: relatedService,
        subject: title,
        summary: description.slice(0, 2000),
        expiresAt,
        publicActivities: {
          create: {
            type: "REQUEST_RECEIVED",
            message: "הבקשה שלך התקבלה",
          },
        },
      },
    });

    await createSessionMessageWithAttachments({
      attachments: validated.attachments,
      message: composedMessage,
      senderId: user.id,
      senderRole: user.role,
      sessionId: chatSession.id,
    });

    revalidatePath("/support/agent");
    return { ok: true, data: { sessionId: chatSession.id, agentAvailable: !!availableAgent } };
  } catch (error) {
    console.error("submitSupportRequest failed:", error);
    return { ok: false, error: validated.attachments.length > 0 ? UPLOAD_ERROR : GENERIC_ERROR };
  }
}

const CANNOT_CANCEL_ERROR = "לא ניתן לבטל פנייה זו — היא כבר בטיפול או נסגרה.";

export async function cancelSupportRequest(sessionId: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    // Only the customer's own still-pending (not yet picked up) requests are
    // cancelable — once an agent accepts it, or it's already resolved/closed,
    // it becomes part of the support record and must stay.
    const result = await prisma.supportSession.updateMany({
      where: { id: sessionId, customerId: user.id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });

    if (result.count === 0) {
      return { ok: false, error: CANNOT_CANCEL_ERROR };
    }

    revalidatePath("/support/agent");
    revalidatePath("/portal");
    return { ok: true };
  } catch (error) {
    console.error("cancelSupportRequest failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function getMyChatStatus(
  sessionId: string
): Promise<
  ActionResult<{
    status: string;
    agentName: string | null;
    agentImageUrl: string | null;
    agentRole: string | null;
  }>
> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    await expireStaleSessions();

    const chatSession = await prisma.supportSession.findUnique({
      where: { id: sessionId },
      include: {
        technician: {
          select: { name: true, displayName: true, profileImageUrl: true, role: true },
        },
      },
    });

    if (!chatSession || chatSession.customerId !== user.id || chatSession.customerDeletedAt) {
      return { ok: false, error: "NOT_FOUND" };
    }

    return {
      ok: true,
      data: {
        status: chatSession.status,
        agentName:
          chatSession.technician?.displayName?.trim() ||
          chatSession.technician?.name?.trim() ||
          null,
        agentImageUrl: chatSession.technician?.profileImageUrl ?? null,
        agentRole: chatSession.technician
          ? ROLE_LABELS[chatSession.technician.role] ?? "נציג/ת תמיכה"
          : null,
      },
    };
  } catch (error) {
    console.error("getMyChatStatus failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type ChatMessageView = {
  id: string;
  message: string;
  isFromCustomer: boolean;
  createdAt: string;
  attachments: ChatAttachment[];
  deletable: boolean;
  deleted: boolean;
};

const DELETED_MESSAGE_PLACEHOLDER = "הודעה נמחקה";

export async function getMyChatMessages(sessionId: string): Promise<ActionResult<ChatMessageView[]>> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const chatSession = await prisma.supportSession.findUnique({ where: { id: sessionId } });
    if (!chatSession || chatSession.customerId !== user.id || chatSession.customerDeletedAt) {
      return { ok: false, error: "NOT_FOUND" };
    }

    const messages = await prisma.sessionMessage.findMany({
      where: { sessionId },
      include: {
        files: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      ok: true,
      data: messages.map((m) => {
        const isDeleted = !!m.deletedAt;
        const isFromCustomer = m.senderId === user.id;
        return {
          id: m.id,
          message: isDeleted ? DELETED_MESSAGE_PLACEHOLDER : m.message,
          isFromCustomer,
          createdAt: m.createdAt.toISOString(),
          attachments: isDeleted
            ? []
            : [...m.files.map(storedSupportAttachmentView), ...legacySupportAttachmentViews(m.attachments)],
          deletable: isFromCustomer && m.senderRole === "CUSTOMER" && !isDeleted,
          deleted: isDeleted,
        };
      }),
    };
  } catch (error) {
    console.error("getMyChatMessages failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function sendCustomerMessage(
  sessionId: string,
  text: string,
  attachments?: SupportAttachmentUpload[]
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const trimmed = text.trim();
  if (!trimmed && (!attachments || attachments.length === 0)) return { ok: false, error: "EMPTY_MESSAGE" };

  const validated = validateSupportAttachments(attachments);
  if (!validated.ok) return { ok: false, error: validated.error };

  try {
    const chatSession = await prisma.supportSession.findUnique({ where: { id: sessionId } });
    if (!chatSession || chatSession.customerId !== user.id || chatSession.customerDeletedAt) {
      return { ok: false, error: "NOT_FOUND" };
    }
    if (chatSession.status !== "ACTIVE") {
      return { ok: false, error: "NOT_ACTIVE" };
    }

    await createSessionMessageWithAttachments({
      attachments: validated.attachments,
      message: trimmed,
      senderId: user.id,
      senderRole: user.role,
      sessionId,
    });

    revalidatePath("/support/agent");
    return { ok: true };
  } catch (error) {
    console.error("sendCustomerMessage failed:", error);
    return { ok: false, error: validated.attachments.length > 0 ? UPLOAD_ERROR : GENERIC_ERROR };
  }
}

// ---------- Agent side ----------

export async function setAgentStatus(status: AgentStatus): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  // Choosing AVAILABLE hands control back to the workflow (auto BUSY/AVAILABLE
  // as chats come and go); choosing BUSY or OFFLINE pins the status until the
  // agent manually changes it again.
  const mode = status === "AVAILABLE" ? "AUTO" : "MANUAL";

  try {
    const activeChatsCount = await prisma.supportSession.count({
      where: { technicianId: user.id, status: "ACTIVE" },
    });

    await prisma.technicianPresence.upsert({
      where: { technicianId: user.id },
      update: { status, mode, activeChatsCount, lastSeenAt: new Date() },
      create: { technicianId: user.id, status, mode, activeChatsCount },
    });

    revalidatePath("/support/agent");
    return { ok: true };
  } catch (error) {
    console.error("setAgentStatus failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function getAgentStatus(): Promise<ActionResult<{ status: AgentStatus }>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    await prisma.technicianPresence.updateMany({
      where: { technicianId: user.id },
      data: { lastSeenAt: new Date() },
    });
    const presence = await prisma.technicianPresence.findUnique({ where: { technicianId: user.id } });
    return { ok: true, data: { status: normalizeAgentStatus(presence?.status) } };
  } catch (error) {
    console.error("getAgentStatus failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type AgentMetrics = {
  pendingCount: number;
  activeCount: number;
  avgResponseMinutes: number;
  closedTodayCount: number;
};

export async function getAgentMetrics(): Promise<ActionResult<AgentMetrics>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    await expireStaleSessions();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [pendingCount, activeCount, closedTodayCount, todaysHandledSessions] = await Promise.all([
      prisma.supportSession.count({ where: { technicianId: null, status: "PENDING" } }),
      prisma.supportSession.count({ where: { technicianId: user.id, status: "ACTIVE" } }),
      prisma.supportSession.count({
        where: { technicianId: user.id, status: { in: ["RESOLVED", "CLOSED"] }, updatedAt: { gte: startOfToday } },
      }),
      prisma.supportSession.findMany({
        where: {
          technicianId: user.id,
          createdAt: { gte: startOfToday },
          status: { in: ["ACTIVE", "CLOSED"] },
        },
        include: {
          messages: {
            where: { senderId: user.id },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      }),
    ]);

    const responseTimesMinutes = todaysHandledSessions
      .filter((s) => s.messages.length > 0)
      .map((s) => (s.messages[0].createdAt.getTime() - s.createdAt.getTime()) / 60000);

    const avgResponseMinutes =
      responseTimesMinutes.length > 0
        ? Math.round(responseTimesMinutes.reduce((a, b) => a + b, 0) / responseTimesMinutes.length)
        : 0;

    return {
      ok: true,
      data: { pendingCount, activeCount, avgResponseMinutes, closedTodayCount },
    };
  } catch (error) {
    console.error("getAgentMetrics failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type PendingChatRequest = {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  category: string | null;
  summary: string | null;
  createdAt: string;
};

export async function getPendingRequests(): Promise<ActionResult<PendingChatRequest[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    await expireStaleSessions();

    const pending = await prisma.supportSession.findMany({
      where: { technicianId: null, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { customer: { select: { name: true, email: true } } },
    });

    return {
      ok: true,
      data: pending.map((s) => ({
        id: s.id,
        customerName: s.customer?.name ?? null,
        customerEmail: s.customer?.email ?? null,
        category: s.category,
        summary: s.summary,
        createdAt: s.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getPendingRequests failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type ActiveChat = {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  category: string | null;
  summary: string | null;
  createdAt: string;
  expiresAt: string | null;
};

export async function getActiveChats(): Promise<ActionResult<ActiveChat[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    await expireStaleSessions();

    const active = await prisma.supportSession.findMany({
      where: { technicianId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } } },
    });

    return {
      ok: true,
      data: active.map((s) => ({
        id: s.id,
        customerName: s.customer?.name ?? null,
        customerEmail: s.customer?.email ?? null,
        category: s.category,
        summary: s.summary,
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt?.toISOString() ?? null,
      })),
    };
  } catch (error) {
    console.error("getActiveChats failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

const ALREADY_HANDLED_MESSAGE = "הבקשה כבר התקבלה על ידי נציג אחר.";
const AGENT_OFFLINE_MESSAGE = "לא ניתן לקבל פניות חדשות במצב 'לא זמין'.";

export type AgentStatusChange = { agentStatus: AgentStatus; message: string | null };

export async function acceptChatRequest(
  sessionId: string
): Promise<ActionResult<AgentStatusChange>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const presence = await prisma.technicianPresence.findUnique({ where: { technicianId: user.id } });
    const currentStatus = normalizeAgentStatus(presence?.status);
    if (currentStatus === "OFFLINE") {
      return { ok: false, error: AGENT_OFFLINE_MESSAGE };
    }

    const outcome = await prisma.$transaction(async (tx) => {
      // Conditional update guards against two agents accepting the same request at once:
      // only the request that still matches PENDING + unassigned wins the row.
      const updated = await tx.supportSession.updateMany({
        where: { id: sessionId, status: "PENDING", technicianId: null },
        data: { technicianId: user.id, status: "ACTIVE", acceptedAt: new Date() },
      });

      if (updated.count === 0) return null;

      await tx.supportActivity.create({
        data: {
          sessionId,
          actorId: user.id,
          type: "AGENT_JOINED",
          message: "נציג תמיכה הצטרף לשיחה",
        },
      });

      return recomputePresenceAfterSessionGain(tx, user.id);
    });

    if (!outcome) {
      return { ok: false, error: ALREADY_HANDLED_MESSAGE };
    }

    revalidatePath("/support/agent");
    return {
      ok: true,
      data: {
        agentStatus: outcome.status,
        message: currentStatus === "AVAILABLE" ? "הסטטוס עודכן לעסוק בעקבות קבלת פנייה." : null,
      },
    };
  } catch (error) {
    console.error("acceptChatRequest failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function rejectChatRequest(sessionId: string): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const result = await prisma.supportSession.updateMany({
      where: { id: sessionId, status: "PENDING", technicianId: null },
      data: { status: "REJECTED" },
    });

    if (result.count === 0) {
      return { ok: false, error: ALREADY_HANDLED_MESSAGE };
    }

    revalidatePath("/support/agent");
    return { ok: true };
  } catch (error) {
    console.error("rejectChatRequest failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function getAgentChatMessages(sessionId: string): Promise<ActionResult<ChatMessageView[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const chatSession = await prisma.supportSession.findUnique({ where: { id: sessionId } });
    if (!chatSession || !canAccessSession(chatSession, user)) {
      return { ok: false, error: "NOT_FOUND" };
    }

    const messages = await prisma.sessionMessage.findMany({
      where: { sessionId },
      include: {
        files: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      ok: true,
      // Staff always sees the real content — a customer hiding a message on their
      // side must not erase it from the support/audit record.
      data: messages.map((m) => ({
        id: m.id,
        message: m.message,
        isFromCustomer: m.senderId === chatSession.customerId,
        createdAt: m.createdAt.toISOString(),
        attachments: [
          ...m.files.map(storedSupportAttachmentView),
          ...legacySupportAttachmentViews(m.attachments),
        ],
        deletable: false,
        deleted: !!m.deletedAt,
      })),
    };
  } catch (error) {
    console.error("getAgentChatMessages failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function sendAgentMessage(
  sessionId: string,
  text: string,
  attachments?: SupportAttachmentUpload[]
): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const trimmed = text.trim();
  if (!trimmed && (!attachments || attachments.length === 0)) return { ok: false, error: "EMPTY_MESSAGE" };

  const validated = validateSupportAttachments(attachments);
  if (!validated.ok) return { ok: false, error: validated.error };

  try {
    const chatSession = await prisma.supportSession.findUnique({ where: { id: sessionId } });
    if (!chatSession || !canAccessSession(chatSession, user)) {
      return { ok: false, error: "NOT_FOUND" };
    }
    if (chatSession.status !== "ACTIVE") {
      return { ok: false, error: "NOT_ACTIVE" };
    }

    await createSessionMessageWithAttachments({
      attachments: validated.attachments,
      message: trimmed,
      senderId: user.id,
      senderRole: user.role,
      sessionId,
    });

    revalidatePath("/support/agent");
    return { ok: true };
  } catch (error) {
    console.error("sendAgentMessage failed:", error);
    return { ok: false, error: validated.attachments.length > 0 ? UPLOAD_ERROR : GENERIC_ERROR };
  }
}

export async function closeChat(sessionId: string): Promise<ActionResult<AgentStatusChange | null>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const chatSession = await prisma.supportSession.findUnique({ where: { id: sessionId } });
    if (!chatSession || !canAccessSession(chatSession, user)) {
      return { ok: false, error: "NOT_FOUND" };
    }

    const technicianId = chatSession.technicianId;

    const outcome = await prisma.$transaction(async (tx) => {
      await tx.supportSession.update({
        where: { id: sessionId },
        data: { status: "CLOSED", closedAt: new Date() },
      });

      await tx.supportActivity.create({
        data: {
          sessionId,
          actorId: user.id,
          type: "CLOSED",
          message: "הפנייה נסגרה",
        },
      });

      if (!technicianId) return null;
      return recomputePresenceAfterSessionLoss(tx, technicianId);
    });

    revalidatePath("/support/agent");

    // Only report a status change back to the caller when they're the technician
    // whose presence actually moved — an admin closing someone else's chat
    // shouldn't see their own status flip in the UI.
    if (!outcome || technicianId !== user.id) {
      return { ok: true, data: null };
    }

    const change: AgentStatusChange = {
      agentStatus: outcome.status,
      message:
        outcome.status === "AVAILABLE"
          ? "הסטטוס חזר לזמין לקבלת פניות."
          : outcome.status === "OFFLINE" && outcome.mode === "MANUAL"
            ? "הסטטוס נשאר לא זמין לפי הבחירה הידנית שלך."
            : null,
    };
    return { ok: true, data: change };
  } catch (error) {
    console.error("closeChat failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type RecentClosedChat = {
  id: string;
  customerName: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  closedAt: string | null;
};

function historyWindowCutoff() {
  return new Date(Date.now() - SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export async function getRecentClosedChats(): Promise<ActionResult<RecentClosedChat[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    await expireStaleSessions();

    const sessions = await prisma.supportSession.findMany({
      where: {
        technicianId: user.id,
        status: { in: ["RESOLVED", "CLOSED", "REJECTED"] },
        createdAt: { gte: historyWindowCutoff() },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
      include: { customer: { select: { name: true } } },
    });

    return {
      ok: true,
      data: sessions.map((s) => ({
        id: s.id,
        customerName: s.customer?.name ?? null,
        category: s.category,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        closedAt: s.closedAt?.toISOString() ?? null,
      })),
    };
  } catch (error) {
    console.error("getRecentClosedChats failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type ConversationTimelineItem =
  | {
      kind: "message";
      id: string;
      message: string;
      isFromCustomer: boolean;
      createdAt: string;
      attachments: ChatAttachment[];
    }
  | { kind: "activity"; id: string; message: string; createdAt: string };

export type SupportConversationDetail = {
  id: string;
  customerName: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  acceptedAt: string | null;
  closedAt: string | null;
  technicianName: string | null;
  timeline: ConversationTimelineItem[];
};

export async function getSupportConversationDetail(
  sessionId: string,
): Promise<ActionResult<SupportConversationDetail>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const chatSession = await prisma.supportSession.findUnique({
      where: { id: sessionId },
      include: {
        customer: { select: { name: true } },
        technician: { select: { name: true, displayName: true } },
      },
    });

    if (!chatSession || !canAccessSession(chatSession, user)) {
      return { ok: false, error: "NOT_FOUND" };
    }
    // Conversations roll off after 7 days, same window shown in the history list —
    // don't let a stale id (or one that expired between list-load and click) load.
    if (chatSession.status === "EXPIRED" || chatSession.createdAt < historyWindowCutoff()) {
      return { ok: false, error: "NOT_FOUND" };
    }

    const [messages, activities] = await Promise.all([
      prisma.sessionMessage.findMany({
        where: { sessionId },
        include: {
          files: {
            where: { expiresAt: { gt: new Date() } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.supportActivity.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const timeline: ConversationTimelineItem[] = [
      ...messages.map((m) => ({
        kind: "message" as const,
        id: m.id,
        message: m.message,
        isFromCustomer: m.senderId === chatSession.customerId,
        createdAt: m.createdAt.toISOString(),
        attachments: [
          ...m.files.map(storedSupportAttachmentView),
          ...legacySupportAttachmentViews(m.attachments),
        ],
      })),
      ...activities.map((a) => ({
        kind: "activity" as const,
        id: a.id,
        message: a.message,
        createdAt: a.createdAt.toISOString(),
      })),
    ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return {
      ok: true,
      data: {
        id: chatSession.id,
        customerName: chatSession.customer?.name ?? null,
        category: chatSession.category,
        status: chatSession.status,
        createdAt: chatSession.createdAt.toISOString(),
        acceptedAt: chatSession.acceptedAt?.toISOString() ?? null,
        closedAt: chatSession.closedAt?.toISOString() ?? null,
        technicianName:
          chatSession.technician?.displayName?.trim() || chatSession.technician?.name?.trim() || null,
        timeline,
      },
    };
  } catch (error) {
    console.error("getSupportConversationDetail failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type SessionNote = {
  id: string;
  content: string;
  authorName: string | null;
  createdAt: string;
};

export async function getSessionNotes(sessionId: string): Promise<ActionResult<SessionNote[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const chatSession = await prisma.supportSession.findUnique({ where: { id: sessionId } });
    if (!chatSession || !canAccessSession(chatSession, user)) {
      return { ok: false, error: "NOT_FOUND" };
    }

    const notes = await prisma.technicianNote.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      include: { technician: { select: { name: true } } },
    });

    return {
      ok: true,
      data: notes.map((n) => ({
        id: n.id,
        content: n.content,
        authorName: n.technician?.name ?? null,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getSessionNotes failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function addSessionNote(sessionId: string, content: string): Promise<ActionResult> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "EMPTY_NOTE" };

  try {
    const chatSession = await prisma.supportSession.findUnique({ where: { id: sessionId } });
    if (!chatSession || !canAccessSession(chatSession, user)) {
      return { ok: false, error: "NOT_FOUND" };
    }

    await prisma.technicianNote.create({
      data: { sessionId, technicianId: user.id, content: trimmed },
    });

    revalidatePath("/support/agent");
    return { ok: true };
  } catch (error) {
    console.error("addSessionNote failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export type RecentSessionOption = {
  id: string;
  customerName: string | null;
  status: string;
  createdAt: string;
};

export async function getMyRecentSessions(): Promise<ActionResult<RecentSessionOption[]>> {
  const user = await requireStaffUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  try {
    await expireStaleSessions();

    const sessions = await prisma.supportSession.findMany({
      where: { technicianId: user.id, status: { in: ["ACTIVE", "RESOLVED", "CLOSED"] } },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { customer: { select: { name: true } } },
    });

    return {
      ok: true,
      data: sessions.map((s) => ({
        id: s.id,
        customerName: s.customer?.name ?? null,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getMyRecentSessions failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
