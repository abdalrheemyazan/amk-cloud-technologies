"use client";

import { AlertTriangle, X } from "lucide-react";
import ModalPortal from "@/components/ui/ModalPortal";

export default function CustomerCancelRequestModal({
  submitting,
  error,
  onConfirm,
  onClose,
}: {
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalPortal
      onClose={onClose}
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      labelledBy="cancel-request-title"
      panelClassName="w-full max-w-sm overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.7)]"
    >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="cancel-request-title" className="text-base font-black text-slate-950">
                ביטול פנייה
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-modal-autofocus
            disabled={submitting}
            aria-label="סגירה"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-xs font-semibold leading-relaxed text-slate-600">
            האם לבטל את הפנייה הזו? לאחר הביטול לא ניתן יהיה להמשיך את הטיפול בפנייה.
          </p>
          {error && <p className="text-[11px] font-bold text-rose-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            חזרה
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-black text-white outline-none transition-colors hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "מבטל..." : "ביטול פנייה"}
          </button>
        </div>
    </ModalPortal>
  );
}
