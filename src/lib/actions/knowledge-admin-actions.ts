"use server";

import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  processKnowledgeDocument,
  syncAllPublishedArticles,
  syncKnowledgeArticleChunks,
} from "@/lib/knowledge/pipeline";
import { removeKnowledgeDocumentObject, storeKnowledgeDocumentObject } from "@/lib/knowledge/storage";

const GENERIC_ERROR = "לא ניתן לבצע את הפעולה כרגע. נסה שוב בעוד מספר רגעים.";
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "text/plain"];
const AUDIENCE_VALUES = new Set(["CUSTOMER_VISIBLE", "SUPPORT_INTERNAL", "TECHNICIAN_ONLY"]);

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMINISTRATOR") return null;
  return { id: session.user.id as string };
}

export type KnowledgeDocumentView = {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  audience: string;
  category: string | null;
  sourceType: string;
  status: string;
  errorMessage: string | null;
  chunkCount: number;
  createdAt: string;
  processedAt: string | null;
};

function documentView(document: {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  audience: string;
  category: string | null;
  sourceType: string;
  status: string;
  errorMessage: string | null;
  chunkCount: number;
  createdAt: Date;
  processedAt: Date | null;
}): KnowledgeDocumentView {
  return {
    id: document.id,
    title: document.title,
    fileName: document.fileName,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    audience: document.audience,
    category: document.category,
    sourceType: document.sourceType,
    status: document.status,
    errorMessage: document.errorMessage,
    chunkCount: document.chunkCount,
    createdAt: document.createdAt.toISOString(),
    processedAt: document.processedAt?.toISOString() ?? null,
  };
}

export async function listKnowledgeDocuments(): Promise<ActionResult<KnowledgeDocumentView[]>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const documents = await prisma.knowledgeDocument.findMany({ orderBy: { createdAt: "desc" } });
    return { ok: true, data: documents.map(documentView) };
  } catch (error) {
    console.error("listKnowledgeDocuments failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function uploadKnowledgeDocument(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "UNAUTHORIZED" };

  const file = formData.get("file");
  const title = String(formData.get("title") || "").trim().slice(0, 200);
  const category = String(formData.get("category") || "").trim().slice(0, 80) || null;
  const audienceRaw = String(formData.get("audience") || "CUSTOMER_VISIBLE");
  const audience = AUDIENCE_VALUES.has(audienceRaw) ? audienceRaw : "CUSTOMER_VISIBLE";

  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "יש לבחור קובץ להעלאה." };
  if (!title) return { ok: false, error: "יש להזין כותרת למסמך." };
  if (!ALLOWED_MIME_TYPES.includes(file.type)) return { ok: false, error: "ניתן להעלות קבצי PDF או TXT בלבד." };
  if (file.size > MAX_FILE_BYTES) return { ok: false, error: "הקובץ גדול מדי (מקסימום 15MB)." };

  let documentId: string | null = null;
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const document = await prisma.knowledgeDocument.create({
      data: {
        title,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        audience,
        category,
        sourceType: "UPLOAD",
        status: "UPLOADED",
      },
    });
    documentId = document.id;

    const storagePath = `${document.id}/${randomUUID()}-${file.name}`;
    await storeKnowledgeDocumentObject({ bytes, fileType: file.type, storagePath });
    await prisma.knowledgeDocument.update({ where: { id: document.id }, data: { storagePath } });

    try {
      await processKnowledgeDocument(document.id);
    } catch (processError) {
      // processKnowledgeDocument already recorded FAILED + errorMessage on the row —
      // the upload itself still succeeded, so this isn't a fatal error for the caller.
      console.error("Initial processing failed for", document.id, processError);
    }

    revalidatePath("/admin/knowledge");
    return { ok: true, data: { id: document.id } };
  } catch (error) {
    if (documentId) {
      await prisma.knowledgeDocument.delete({ where: { id: documentId } }).catch(() => {});
    }
    console.error("uploadKnowledgeDocument failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function reprocessKnowledgeDocument(documentId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const document = await prisma.knowledgeDocument.findUnique({ where: { id: documentId } });
    if (!document) return { ok: false, error: GENERIC_ERROR };

    if (document.sourceType === "ARTICLE" && document.sourceArticleId) {
      await syncKnowledgeArticleChunks(document.sourceArticleId);
    } else {
      await processKnowledgeDocument(documentId);
    }

    revalidatePath("/admin/knowledge");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("reprocessKnowledgeDocument failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function deleteKnowledgeDocument(documentId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const document = await prisma.knowledgeDocument.findUnique({ where: { id: documentId } });
    if (!document) return { ok: true, data: undefined };

    if (document.storagePath) {
      await removeKnowledgeDocumentObject(document.storagePath).catch((error) => {
        console.error("Failed to remove knowledge document storage object:", error);
      });
    }
    await prisma.knowledgeDocument.delete({ where: { id: documentId } });

    revalidatePath("/admin/knowledge");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("deleteKnowledgeDocument failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function syncArticlesToKnowledgeBase(): Promise<ActionResult<{ synced: number; failed: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "UNAUTHORIZED" };

  try {
    const result = await syncAllPublishedArticles();
    revalidatePath("/admin/knowledge");
    return { ok: true, data: result };
  } catch (error) {
    console.error("syncArticlesToKnowledgeBase failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
