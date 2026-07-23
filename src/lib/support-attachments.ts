import "server-only";

import { randomUUID } from "node:crypto";
import {
  removeSupportAttachmentObjects,
  storeSupportAttachmentObject,
} from "@/lib/support-attachment-storage";

export const MAX_SUPPORT_ATTACHMENTS = 3;
export const MAX_SUPPORT_ATTACHMENT_BYTES = 3 * 1024 * 1024;
export const SUPPORT_ATTACHMENT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

export type SupportAttachmentUpload = {
  dataUrl: string;
  fileName: string;
  fileSize: number;
};

export type SupportAttachmentView = {
  id?: string;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
};

export type PreparedSupportAttachment = {
  bytes: Buffer;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
};

export type StagedSupportAttachment = PreparedSupportAttachment & {
  storageProvider: "SUPABASE" | "DATABASE";
  storagePath: string;
  inlineData: string | null;
};

type ValidationResult =
  | { ok: true; attachments: PreparedSupportAttachment[] }
  | { ok: false; error: string };

function hasValidSignature(fileType: string, bytes: Buffer) {
  if (fileType === "image/png") {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (fileType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (fileType === "image/webp") {
    return bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  }
  return false;
}

function normalizeDisplayFileName(fileName: string, fileType: string) {
  const extension = fileType === "image/jpeg" ? "jpg" : fileType.split("/")[1];
  return fileName.trim().slice(0, 160) || `support-image.${extension}`;
}

function safeStorageFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return normalized || "support-image";
}

export function validateSupportAttachments(
  attachments?: SupportAttachmentUpload[],
): ValidationResult {
  if (!attachments || attachments.length === 0) {
    return { ok: true, attachments: [] };
  }

  if (attachments.length > MAX_SUPPORT_ATTACHMENTS) {
    return { ok: false, error: "ניתן לצרף עד 3 תמונות בכל הודעה." };
  }

  const prepared: PreparedSupportAttachment[] = [];
  for (const attachment of attachments) {
    const match = DATA_URL_PATTERN.exec(attachment.dataUrl);
    const fileType = match?.[1];
    if (!fileType || !ALLOWED_IMAGE_MIME_TYPES.has(fileType)) {
      return { ok: false, error: "סוג הקובץ אינו נתמך. ניתן להעלות PNG, JPG או WEBP בלבד." };
    }

    const bytes = Buffer.from(match[2], "base64");
    if (bytes.byteLength > MAX_SUPPORT_ATTACHMENT_BYTES) {
      return { ok: false, error: "גודל התמונה חורג מהמותר (עד 3MB)." };
    }
    if (!hasValidSignature(fileType, bytes)) {
      return { ok: false, error: "סוג הקובץ אינו נתמך. ניתן להעלות PNG, JPG או WEBP בלבד." };
    }

    prepared.push({
      bytes,
      dataUrl: attachment.dataUrl,
      fileName: normalizeDisplayFileName(attachment.fileName, fileType),
      fileSize: bytes.byteLength,
      fileType,
    });
  }

  return { ok: true, attachments: prepared };
}

export async function stageSupportAttachments({
  attachments,
  messageId,
  scope,
}: {
  attachments: PreparedSupportAttachment[];
  messageId: string;
  scope: string;
}) {
  const timestamp = Date.now();
  const uploadResults = await Promise.allSettled(
    attachments.map(async (attachment, index) => {
      const storagePath = `support-chats/${scope}/${messageId}/${timestamp}-${index}-${randomUUID()}-${safeStorageFileName(attachment.fileName)}`;
      const stored = await storeSupportAttachmentObject({
        bytes: attachment.bytes,
        dataUrl: attachment.dataUrl,
        fileType: attachment.fileType,
        storagePath,
      });
      return { ...attachment, ...stored };
    }),
  );

  const staged = uploadResults.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  const failure = uploadResults.find((result) => result.status === "rejected");

  if (failure) {
    await removeSupportAttachmentObjects(staged).catch((error) => {
      console.error("Failed to roll back support attachment uploads:", error);
    });
    throw failure.reason;
  }

  return staged;
}

export async function discardStagedSupportAttachments(attachments: StagedSupportAttachment[]) {
  await removeSupportAttachmentObjects(attachments);
}

export function supportAttachmentCreateData(
  attachment: StagedSupportAttachment,
  {
    expiresAt,
    sessionId,
    uploadedById,
  }: { expiresAt: Date; sessionId?: string | null; uploadedById: string },
) {
  return {
    expiresAt,
    fileName: attachment.fileName,
    fileSize: attachment.fileSize,
    fileType: attachment.fileType,
    inlineData: attachment.inlineData,
    publicUrl: null,
    sessionId: sessionId || null,
    storagePath: attachment.storagePath,
    storageProvider: attachment.storageProvider,
    uploadedById,
  };
}

export function storedSupportAttachmentView(attachment: {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}): SupportAttachmentView {
  return {
    id: attachment.id,
    dataUrl: `/api/support/attachments/${encodeURIComponent(attachment.id)}`,
    fileName: attachment.fileName,
    fileSize: attachment.fileSize,
    fileType: attachment.fileType,
  };
}

export function legacySupportAttachmentViews(value: unknown): SupportAttachmentView[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Partial<SupportAttachmentUpload>;
    if (
      typeof candidate.dataUrl !== "string" ||
      typeof candidate.fileName !== "string" ||
      typeof candidate.fileSize !== "number"
    ) {
      return [];
    }
    return [{ dataUrl: candidate.dataUrl, fileName: candidate.fileName, fileSize: candidate.fileSize }];
  });
}

export function supportAttachmentExpiry() {
  return new Date(Date.now() + SUPPORT_ATTACHMENT_TTL_MS);
}
