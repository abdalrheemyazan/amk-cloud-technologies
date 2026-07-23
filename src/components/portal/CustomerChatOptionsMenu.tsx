"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCirclePlus, MoreHorizontal, Trash2, XCircle } from "lucide-react";

export type CustomerChatOptionsMenuAction = "new" | "close" | "delete";

export default function CustomerChatOptionsMenu({
  canClose,
  canDelete,
  onAction,
}: {
  canClose: boolean;
  canDelete: boolean;
  onAction: (action: CustomerChatOptionsMenuAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function select(action: CustomerChatOptionsMenuAction) {
    setOpen(false);
    onAction(action);
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="אפשרויות שיחה"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 outline-none transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <MoreHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="אפשרויות שיחה"
          dir="rtl"
          className="absolute left-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.55)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => select("new")}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-right text-xs font-black text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50"
          >
            <MessageCirclePlus className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            שיחה חדשה
          </button>

          {canClose ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => select("close")}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-right text-xs font-black text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50"
            >
              <XCircle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              סיום שיחה
            </button>
          ) : null}

          {canDelete ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => select("delete")}
              className="flex w-full items-center gap-2.5 border-t border-slate-100 px-3.5 py-2.5 text-right text-xs font-black text-rose-600 outline-none transition-colors hover:bg-rose-50 focus-visible:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              מחיקת שיחה
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
