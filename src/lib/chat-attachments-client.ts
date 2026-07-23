export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_MESSAGE = 3;

export type PendingAttachment = { dataUrl: string; fileName: string; fileSize: number };
export type AttachmentSelectionOptions = { maxAttachments?: number };

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function processSelectedFiles(
  files: File[],
  currentCount: number,
  options: AttachmentSelectionOptions = {},
): Promise<{ attachments: PendingAttachment[]; error: string | null }> {
  const validationError = validateSelectedImageFiles(files, currentCount, options);
  if (validationError) return { attachments: [], error: validationError };

  try {
    const attachments = await Promise.all(
      files.map(async (file) => ({
        dataUrl: await readFileAsDataUrl(file),
        fileName: file.name,
        fileSize: file.size,
      })),
    );

    return { attachments, error: null };
  } catch {
    return { attachments: [], error: "לא ניתן לקרוא את התמונה שנבחרה. נסה לבחור קובץ אחר." };
  }
}

export function validateSelectedImageFiles(
  files: Array<Pick<File, "size" | "type">>,
  currentCount: number,
  { maxAttachments = MAX_ATTACHMENTS_PER_MESSAGE }: AttachmentSelectionOptions = {},
): string | null {
  if (currentCount + files.length > maxAttachments) {
    return maxAttachments === 1
      ? "ניתן לצרף תמונה אחת בכל הודעה."
      : `ניתן לצרף עד ${maxAttachments} תמונות בכל הודעה.`;
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "ניתן להעלות תמונות בלבד מסוג JPG, PNG או WEBP.";
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return "גודל התמונה חורג מהמותר (עד 3MB).";
    }
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
