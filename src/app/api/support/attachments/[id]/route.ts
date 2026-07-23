import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";
import { downloadSupportAttachmentObject } from "@/lib/support-attachment-storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id as string | undefined;
  const role = session?.user?.role as Role | undefined;
  if (!userId || !role) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;

  try {
    const attachment = await prisma.supportAttachment.findUnique({
      where: { id },
      include: {
        internalMessage: {
          select: { recipientId: true, senderId: true },
        },
        session: {
          select: { customerId: true, technicianId: true },
        },
      },
    });

    if (!attachment) return new Response("Not found", { status: 404 });
    if (attachment.expiresAt <= new Date()) return new Response("Expired", { status: 410 });

    const isAdministrator = role === Role.ADMINISTRATOR;
    const isStaff = STAFF_ROLES.includes(role);
    const canReadInternal = attachment.internalMessage
      ? isStaff &&
        (isAdministrator ||
          attachment.internalMessage.senderId === userId ||
          attachment.internalMessage.recipientId === userId)
      : false;
    const canReadSession = attachment.session
      ? isAdministrator ||
        attachment.session.customerId === userId ||
        (isStaff && attachment.session.technicianId === userId)
      : false;

    const canRead = attachment.internalMessage ? canReadInternal : canReadSession;
    if (!canRead) {
      return new Response("Forbidden", { status: 403 });
    }

    const file = await downloadSupportAttachmentObject(attachment);
    const safeName = encodeURIComponent(attachment.fileName);

    return new Response(file.bytes, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `inline; filename*=UTF-8''${safeName}`,
        "Content-Length": String(file.bytes.byteLength),
        "Content-Type": file.fileType || attachment.fileType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Failed to load support attachment:", error);
    return new Response("Attachment unavailable", { status: 500 });
  }
}
