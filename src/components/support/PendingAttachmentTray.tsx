"use client";

import { X } from "lucide-react";
import { formatFileSize, type PendingAttachment } from "@/lib/chat-attachments-client";

export default function PendingAttachmentTray({
  attachments,
  onRemove,
}: {
  attachments: PendingAttachment[];
  onRemove: (index: number) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="grid gap-1.5 sm:grid-cols-2" aria-label="תמונות שנבחרו">
      {attachments.map((attachment, index) => (
        <div
          key={`${attachment.fileName}-${index}`}
          className="flex min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-1.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.dataUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-blue-100"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[9px] font-black text-slate-700">
              {attachment.fileName}
            </span>
            <span className="mt-0.5 block text-[8px] font-bold text-slate-400">
              {formatFileSize(attachment.fileSize)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`הסרת ${attachment.fileName}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 outline-none transition-colors hover:bg-white hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
