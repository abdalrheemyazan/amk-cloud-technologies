"use client";

import { useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import SupportAgentAvatar from "@/components/support/SupportAgentAvatar";

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("READ_FAILED")));
    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

export default function CustomerProfileImageUpload({
  userName,
  currentImageUrl,
  pendingDataUrl,
  removed,
  onSelect,
  onRemove,
  onValidationError,
  error,
}: {
  userName: string | null;
  currentImageUrl: string | null;
  pendingDataUrl: string | null;
  removed: boolean;
  onSelect: (dataUrl: string) => void;
  onRemove: () => void;
  onValidationError: (message: string) => void;
  error: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayedImage = removed ? null : pendingDataUrl || currentImageUrl;

  async function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      onValidationError("סוג הקובץ אינו נתמך. ניתן להעלות JPG, PNG או WEBP בלבד.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onValidationError("הקובץ גדול מדי. ניתן להעלות תמונה עד 2MB.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      onSelect(dataUrl);
    } catch {
      onValidationError("לא ניתן היה לקרוא את הקובץ שנבחר. נסה קובץ אחר.");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <SupportAgentAvatar name={userName} imageUrl={displayedImage} className="h-16 w-16" textClassName="text-base" />
      </div>

      <div className="min-w-0 flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            void handleFileChange(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-black text-[#0F172A] transition-colors hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            העלאת תמונה
          </button>
          {displayedImage && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-black text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              הסרת תמונה
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[10px] font-semibold text-[#94A3B8]">JPG, PNG או WEBP · עד 2MB</p>
        {error && <p className="mt-1 text-[11px] font-bold text-rose-600">{error}</p>}
      </div>
    </div>
  );
}
