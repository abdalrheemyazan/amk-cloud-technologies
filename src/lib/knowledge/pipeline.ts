import "server-only";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { embedTexts } from "@/lib/ai/embeddings";
import { chunkText } from "./chunking";
import { extractPdfText } from "./pdf-extract";
import { downloadKnowledgeDocumentObject } from "./storage";
import { setChunkEmbedding } from "./vector-search";

type PendingChunk = { content: string; pageNumber: number | null };

// Shared by document processing and article backfill: chunk, embed, and store
// against a KnowledgeDocument that already exists. Replaces any prior chunks
// for that document (safe for reprocessing / re-syncing).
async function chunkEmbedAndStore(
  documentId: string,
  pending: PendingChunk[],
  meta: { title: string; category: string | null; audience: string },
): Promise<number> {
  if (pending.length === 0) {
    throw new Error("No content to index — the source produced no usable text.");
  }

  await prisma.knowledgeChunk.deleteMany({ where: { documentId } });

  const rows = pending.map((chunk, index) => ({
    id: randomUUID(),
    documentId,
    chunkIndex: index,
    pageNumber: chunk.pageNumber,
    title: meta.title,
    category: meta.category,
    audience: meta.audience,
    content: chunk.content,
  }));

  await prisma.knowledgeChunk.createMany({ data: rows });

  const embeddings = await embedTexts(
    rows.map((row) => row.content),
    "RETRIEVAL_DOCUMENT",
  );
  // Sequential on purpose — the Prisma pool is deliberately capped at a single
  // connection (see src/lib/prisma.ts), so concurrent writes just queue anyway.
  for (let i = 0; i < rows.length; i += 1) {
    await setChunkEmbedding(rows[i].id, embeddings[i]);
  }

  return rows.length;
}

export async function processKnowledgeDocument(documentId: string): Promise<void> {
  const document = await prisma.knowledgeDocument.findUnique({ where: { id: documentId } });
  if (!document) throw new Error("Knowledge document not found");
  if (!document.storagePath) throw new Error("Document has no stored file to process");

  await prisma.knowledgeDocument.update({
    where: { id: documentId },
    data: { status: "PROCESSING", errorMessage: null },
  });

  try {
    const bytes = await downloadKnowledgeDocumentObject(document.storagePath);

    const pending: PendingChunk[] = [];
    if (document.mimeType === "application/pdf") {
      const extracted = await extractPdfText(bytes);
      for (const page of extracted.pages) {
        for (const chunk of chunkText(page.text)) {
          pending.push({ content: chunk.content, pageNumber: page.pageNumber });
        }
      }
    } else {
      const text = bytes.toString("utf-8");
      for (const chunk of chunkText(text)) {
        pending.push({ content: chunk.content, pageNumber: null });
      }
    }

    const chunkCount = await chunkEmbedAndStore(documentId, pending, {
      title: document.title,
      category: document.category,
      audience: document.audience,
    });

    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: "READY", chunkCount, processedAt: new Date(), errorMessage: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "עיבוד הקובץ נכשל.";
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: "FAILED", errorMessage: message },
    });
    throw error;
  }
}

const ARTICLE_AUDIENCE_MAP: Record<string, string> = {
  CUSTOMER: "CUSTOMER_VISIBLE",
  INTERNAL: "SUPPORT_INTERNAL",
};

function composeArticleText(article: {
  title: string;
  content: string;
  symptoms: string | null;
  diagnosisSteps: string | null;
  resolutionSteps: string | null;
  customerReplyTemplate: string | null;
}) {
  return [
    article.title,
    article.content,
    article.symptoms,
    article.diagnosisSteps,
    article.resolutionSteps,
    article.customerReplyTemplate,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Keeps a KnowledgeArticle's content searchable through the same semantic
// index as uploaded files, via a lightweight "virtual" KnowledgeDocument that
// mirrors it. Call after creating/editing/publishing an article, or in bulk
// as a one-time backfill so existing content isn't lost when this system
// replaces keyword-only grounding.
export async function syncKnowledgeArticleChunks(articleId: string): Promise<void> {
  const article = await prisma.knowledgeArticle.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("Knowledge article not found");

  const audience = ARTICLE_AUDIENCE_MAP[article.audience] ?? "SUPPORT_INTERNAL";

  if (!article.isPublished) {
    // Unpublished articles shouldn't be searchable — drop any prior mirror.
    await prisma.knowledgeDocument.deleteMany({ where: { sourceArticleId: articleId } });
    return;
  }

  const document = await prisma.knowledgeDocument.upsert({
    where: { id: `article-${articleId}` },
    update: {
      title: article.title,
      audience,
      category: article.category,
      status: "PROCESSING",
      errorMessage: null,
    },
    create: {
      id: `article-${articleId}`,
      title: article.title,
      fileName: `${article.slug}.md`,
      mimeType: "text/markdown",
      sizeBytes: 0,
      audience,
      category: article.category,
      sourceType: "ARTICLE",
      sourceArticleId: articleId,
      status: "PROCESSING",
    },
  });

  try {
    const text = composeArticleText(article);
    const pending: PendingChunk[] = chunkText(text).map((chunk) => ({
      content: chunk.content,
      pageNumber: null,
    }));

    const chunkCount = await chunkEmbedAndStore(document.id, pending, {
      title: article.title,
      category: article.category,
      audience,
    });

    await prisma.knowledgeDocument.update({
      where: { id: document.id },
      data: { status: "READY", chunkCount, processedAt: new Date(), errorMessage: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "סנכרון המאמר נכשל.";
    await prisma.knowledgeDocument.update({
      where: { id: document.id },
      data: { status: "FAILED", errorMessage: message },
    });
    throw error;
  }
}

export async function syncAllPublishedArticles(): Promise<{ synced: number; failed: number }> {
  const articles = await prisma.knowledgeArticle.findMany({
    where: { isPublished: true },
    select: { id: true },
  });

  let synced = 0;
  let failed = 0;
  for (const article of articles) {
    try {
      await syncKnowledgeArticleChunks(article.id);
      synced += 1;
    } catch (error) {
      console.error(`Failed to sync knowledge article ${article.id}:`, error);
      failed += 1;
    }
  }
  return { synced, failed };
}
