import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EMBEDDING_DIMENSIONS } from "@/lib/ai/embeddings";

// Prisma's `Unsupported("vector(N)")` fields can't be written through the normal
// client API, so chunk rows are created with Prisma first and the embedding is
// set with a raw parameterized UPDATE right after.
function toVectorLiteral(embedding: number[]): string {
  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected a ${EMBEDDING_DIMENSIONS}-dimension embedding, got ${embedding.length}`);
  }
  return `[${embedding.join(",")}]`;
}

export async function setChunkEmbedding(chunkId: string, embedding: number[]): Promise<void> {
  const literal = toVectorLiteral(embedding);
  await prisma.$executeRaw`UPDATE "KnowledgeChunk" SET embedding = ${literal}::vector WHERE id = ${chunkId}`;
}

export type MatchedKnowledgeChunk = {
  id: string;
  documentId: string;
  content: string;
  title: string | null;
  pageNumber: number | null;
  audience: string;
  similarity: number;
};

export async function matchKnowledgeChunks({
  queryEmbedding,
  audience,
  limit = 5,
  minSimilarity = 0.65,
}: {
  queryEmbedding: number[];
  /**
   * A single audience (e.g. the customer chatbot's "CUSTOMER_VISIBLE") or a set
   * of audiences (e.g. the internal support assistant reading customer +
   * internal knowledge). A single string keeps the original equality behaviour.
   */
  audience: string | string[];
  limit?: number;
  minSimilarity?: number;
}): Promise<MatchedKnowledgeChunk[]> {
  const literal = toVectorLiteral(queryEmbedding);
  const audiences = Array.isArray(audience) ? audience : [audience];

  // Cosine distance (`<=>`) ranges 0 (identical) to 2 (opposite); similarity = 1 - distance.
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      documentId: string;
      content: string;
      title: string | null;
      pageNumber: number | null;
      audience: string;
      similarity: number;
    }>
  >(Prisma.sql`
    SELECT id, "documentId", content, title, "pageNumber", audience,
           1 - (embedding <=> ${literal}::vector) AS similarity
    FROM "KnowledgeChunk"
    WHERE audience = ANY(${audiences}::text[]) AND embedding IS NOT NULL
    ORDER BY embedding <=> ${literal}::vector
    LIMIT ${limit}
  `);

  return rows.filter((row) => row.similarity >= minSimilarity);
}
