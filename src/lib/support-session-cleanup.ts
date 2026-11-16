import "server-only";

import { prisma } from "@/lib/prisma";
import { removeSupportAttachmentObjects } from "@/lib/support-attachment-storage";

// Deliberately NOT a "use server" module: anything exported from a server-action
// file becomes a public endpoint any visitor can POST to. This housekeeping job
// deletes data, so it is only reachable from code that has already checked auth.

const SESSION_TTL_DAYS = 7;
const CLEANUP_MIN_INTERVAL_MS = 60_000;
let lastCleanupAt = 0;

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
