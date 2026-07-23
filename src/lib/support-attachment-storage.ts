import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_BUCKET = "support-chat-uploads";
const FIVE_MEGABYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

type StorageRecord = {
  storageProvider: "SUPABASE" | "DATABASE";
  storagePath: string;
  inlineData: string | null;
};

type StoredObject = {
  storageProvider: string;
  storagePath: string;
  inlineData: string | null;
  fileType: string;
};

let supabaseClient: SupabaseClient | null | undefined;
let bucketReady: Promise<void> | null = null;

function getSupabaseClient() {
  if (supabaseClient !== undefined) return supabaseClient;

  const url = process.env.SUPABASE_URL?.trim();
  const secret = (
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();

  if (!url || !secret) {
    supabaseClient = null;
    return null;
  }

  supabaseClient = createClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  return supabaseClient;
}

function getBucketName() {
  return process.env.SUPABASE_SUPPORT_CHAT_BUCKET?.trim() || DEFAULT_BUCKET;
}

async function ensureStorageBucket(client: SupabaseClient) {
  if (bucketReady) return bucketReady;

  bucketReady = (async () => {
    const bucketName = getBucketName();
    const { data } = await client.storage.getBucket(bucketName);
    if (data) return;

    const { error } = await client.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: FIVE_MEGABYTES,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    });

    if (error && !error.message.toLowerCase().includes("already exists")) {
      bucketReady = null;
      throw error;
    }
  })();

  return bucketReady;
}

export async function storeSupportAttachmentObject({
  bytes,
  dataUrl,
  fileType,
  storagePath,
}: {
  bytes: Buffer;
  dataUrl: string;
  fileType: string;
  storagePath: string;
}): Promise<StorageRecord> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      storageProvider: "DATABASE",
      storagePath: `inline://${storagePath}`,
      inlineData: dataUrl,
    };
  }

  await ensureStorageBucket(client);
  const { error } = await client.storage.from(getBucketName()).upload(storagePath, bytes, {
    cacheControl: "604800",
    contentType: fileType,
    upsert: false,
  });

  if (error) throw error;

  return {
    storageProvider: "SUPABASE",
    storagePath,
    inlineData: null,
  };
}

export async function removeSupportAttachmentObjects(
  records: Array<{ storageProvider: string; storagePath: string }>,
) {
  const paths = Array.from(
    new Set(
      records
        .filter((record) => record.storageProvider === "SUPABASE")
        .map((record) => record.storagePath),
    ),
  );

  if (paths.length === 0) return;

  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.storage.from(getBucketName()).remove(paths);
  if (error) throw error;
}

export async function downloadSupportAttachmentObject(record: StoredObject) {
  if (record.storageProvider !== "SUPABASE") {
    const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(record.inlineData || "");
    if (!match) throw new Error("Attachment data is unavailable");
    return {
      bytes: Buffer.from(match[2], "base64"),
      fileType: match[1] || record.fileType,
    };
  }

  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase Storage is not configured");

  const { data, error } = await client.storage
    .from(getBucketName())
    .download(record.storagePath, {}, { cache: "no-store" });

  if (error || !data) throw error || new Error("Attachment data is unavailable");
  return {
    bytes: Buffer.from(await data.arrayBuffer()),
    fileType: data.type || record.fileType,
  };
}
