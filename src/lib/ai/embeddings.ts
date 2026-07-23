import "server-only";

import { getGeminiClient } from "./gemini";

const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
// Fixed at 768 to match the KnowledgeChunk.embedding vector(768) column —
// changing this requires a matching column-width migration.
export const EMBEDDING_DIMENSIONS = 768;
const EMBED_BATCH_SIZE = 20;

function embeddingModel() {
  return process.env.GEMINI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;
}

// Gemini's embedding model produces asymmetric embeddings: documents and
// queries are embedded with different task types for better retrieval quality.
export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

async function embedBatch(texts: string[], taskType: EmbeddingTaskType): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await getGeminiClient().models.embedContent({
    model: embeddingModel(),
    contents: texts,
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const embeddings = response.embeddings ?? [];
  if (embeddings.length !== texts.length) {
    throw new Error("Gemini returned a different number of embeddings than requested");
  }

  return embeddings.map((embedding) => {
    const values = embedding.values;
    if (!values || values.length === 0) throw new Error("Gemini returned an empty embedding");
    return values;
  });
}

export async function embedText(text: string, taskType: EmbeddingTaskType): Promise<number[]> {
  const [embedding] = await embedBatch([text], taskType);
  return embedding;
}

// Batches requests to stay well under the API's per-request content limits.
export async function embedTexts(texts: string[], taskType: EmbeddingTaskType): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
    results.push(...(await embedBatch(batch, taskType)));
  }
  return results;
}
