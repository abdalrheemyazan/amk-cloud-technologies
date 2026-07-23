"use client";

import { useState } from "react";
import { Download, ImageIcon, X } from "lucide-react";
import { formatFileSize } from "@/lib/chat-attachments-client";
import ModalPortal from "@/components/ui/ModalPortal";

type Attachment = { dataUrl: string; fileName: string; fileSize: number; fileType?: string };

export default function AttachmentThumbnails({
  attachments,
  className = "mt-2",
}: {
  attachments: Attachment[];
  className?: string;
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const previewItem = previewIndex !== null ? attachments?.[previewIndex] ?? null : null;

  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <div className={`${className} flex flex-wrap gap-2`}>
        {attachments.map((attachment, index) => (
          <button
            type="button"
            key={`${attachment.fileName}-${index}`}
            onClick={() => setPreviewIndex(index)}
            aria-label={`פתיחת תצוגה מוגדלת של ${attachment.fileName}`}
            className="group flex w-[104px] flex-col overflow-hidden rounded-xl border border-black/10 bg-white/90 text-right outline-none transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_8px_20px_-12px_rgba(15,23,42,0.35)] focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <span className="relative block h-[72px] w-full shrink-0 overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.dataUrl}
                alt={attachment.fileName}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </span>
            <span className="min-w-0 px-1.5 py-1.5">
              <span className="block truncate text-[9px] font-black text-slate-700">{attachment.fileName}</span>
              <span className="mt-0.5 block text-[8px] font-bold text-slate-400" dir="ltr">
                {formatFileSize(attachment.fileSize)}
              </span>
            </span>
          </button>
        ))}
      </div>

      {previewItem && (
        <ModalPortal
          onClose={() => setPreviewIndex(null)}
          ariaLabel={`תצוגת ${previewItem.fileName}`}
          rootClassName="items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:p-6"
          panelClassName="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[20px] bg-white shadow-[0_30px_100px_-35px_rgba(0,0,0,0.75)]"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewItem.dataUrl} alt={previewItem.fileName} className="max-h-[70vh] w-full bg-slate-50 object-contain" />
            <div className="flex items-center justify-between gap-3 p-4" dir="rtl">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F4F7FB] text-[#94A3B8]">
                  <ImageIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#0F172A]">{previewItem.fileName}</p>
                  <p className="text-xs font-semibold text-[#94A3B8]" dir="ltr">
                    {formatFileSize(previewItem.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={previewItem.dataUrl}
                  download={previewItem.fileName}
                  aria-label={`הורדת ${previewItem.fileName}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F7FB] text-[#64748B] transition-colors hover:bg-slate-100 hover:text-blue-700"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                </a>
                <button
                  onClick={() => setPreviewIndex(null)}
                  data-modal-autofocus
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F7FB] text-[#64748B] transition-colors hover:bg-slate-100"
                  aria-label="סגירה"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
        </ModalPortal>
      )}
    </>
  );
}
