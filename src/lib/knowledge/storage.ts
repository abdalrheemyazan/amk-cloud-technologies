import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_BUCKET = "knowledge-documents";
const TWENTY_MEGABYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "text/plain"];

let supabaseClient: SupabaseClient | null | undefined;
let bucketReady: Promise<void> | null = null;

function getSupabaseClient() {
  if (supabaseClient !== undefined) return supabaseClient;

  const url = process.env.SUPABASE_URL?.trim();
  const secret = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !secret) {
    supabaseClient = null;
    return null;
  }

  supabaseClient = createClient(url, secret, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  return supabaseClient;
}

function getBucketName() {
  return process.env.SUPABASE_KNOWLEDGE_BUCKET?.trim() || DEFAULT_BUCKET;
}

async function ensureBucket(client: SupabaseClient) {
  if (bucketReady) return bucketReady;

  bucketReady = (async () => {
    const bucketName = getBucketName();
    const { data } = await client.storage.getBucket(bucketName);
    if (data) return;

    const { error } = await client.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: TWENTY_MEGABYTES,
      allowedMimeTypes: ALLOWED_TYPES,
    });
    if (error && !error.message.toLowerCase().includes("already exists")) {
      bucketReady = null;
      throw error;
    }
  })();

  return bucketReady;
}

export class KnowledgeStorageNotConfiguredError extends Error {
  constructor() {
    super("Supabase Storage is not configured");
    this.name = "KnowledgeStorageNotConfiguredError";
  }
}

export async function storeKnowledgeDocumentObject({
  bytes,
  fileType,
  storagePath,
}: {
  bytes: Buffer;
  fileType: string;
  storagePath: string;
}): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new KnowledgeStorageNotConfiguredError();

  await ensureBucket(client);
  const { error } = await client.storage.from(getBucketName()).upload(storagePath, bytes, {
    contentType: fileType,
    upsert: true,
  });
  if (error) throw error;
}

export async function downloadKnowledgeDocumentObject(storagePath: string): Promise<Buffer> {
  const client = getSupabaseClient();
  if (!client) throw new KnowledgeStorageNotConfiguredError();

  const { data, error } = await client.storage.from(getBucketName()).download(storagePath);
  if (error || !data) throw error || new Error("File not found in storage");
  return Buffer.from(await data.arrayBuffer());
}

export async function removeKnowledgeDocumentObject(storagePath: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.storage.from(getBucketName()).remove([storagePath]);
}
