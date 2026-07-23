"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StickyNote } from "lucide-react";
import { addTechnicianNote } from "@/lib/actions/note-actions";
import { relativeTimeFromNow } from "@/lib/support-labels";
import type { TechnicianNoteItem } from "@/lib/support-types";

export default function TreatmentNotesSection({ notes }: { notes: TechnicianNoteItem[] }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!content.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addTechnicianNote(content.trim());
      if (result.ok) {
        setContent("");
        router.refresh();
      } else {
        setError("שמירת ההערה נכשלה, נסה שוב");
      }
    });
  };

  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <StickyNote className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">הערות טיפול</h2>
      </div>

      <div className="mb-5 rounded-xl border border-[#E2E8F0] p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          placeholder="הוסף הערת עבודה אישית..."
          className="w-full resize-none rounded-lg border-none bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[10px] font-medium text-[#94A3B8]">ההערות אישיות וגלויות לך בלבד.</p>
          <button
            type="button"
            disabled={isPending || !content.trim()}
            onClick={handleAdd}
            className="rounded-lg bg-[#2563EB] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
          >
            הוספת הערה
          </button>
        </div>
        {error && <p className="mt-1.5 text-[11px] font-semibold text-[#EF4444]">{error}</p>}
      </div>

      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-8 text-center">
          <p className="text-sm font-semibold text-[#0F172A]">אין הערות טיפול עדיין</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-[#E2E8F0]">
          {notes.map((note) => (
            <li key={note.id} className="py-3">
              <p className="whitespace-pre-wrap text-sm text-[#334155]">{note.content}</p>
              <p className="mt-1 text-[11px] font-medium text-[#94A3B8]">{relativeTimeFromNow(note.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
