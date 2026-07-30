"use client";

import { useEffect, useState } from "react";
import { StickyNote, Send } from "lucide-react";
import {
  addSessionNote,
  getMyRecentSessions,
  getSessionNotes,
  type RecentSessionOption,
  type SessionNote,
} from "@/lib/actions/support-chat-actions";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function SessionNotesSection({ initialSessionId }: { initialSessionId: string | null }) {
  const [sessions, setSessions] = useState<RecentSessionOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialSessionId);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMyRecentSessions().then((result) => {
      if (result.ok) {
        setSessions(result.data);
        setSelectedId((prev) => prev ?? result.data[0]?.id ?? null);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    // Clear notes and loaded asynchronously or via callbacks to prevent setState-in-effect
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoaded(false);
      setNotes([]);
    });
    getSessionNotes(selectedId).then((result) => {
      if (cancelled) return;
      if (result.ok) setNotes(result.data);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [selectedId]);

  async function handleAddNote() {
    const trimmed = noteInput.trim();
    if (!trimmed || !selectedId) return;
    setNoteInput("");
    const result = await addSessionNote(selectedId, trimmed);
    if (result.ok) {
      const refreshed = await getSessionNotes(selectedId);
      if (refreshed.ok) setNotes(refreshed.data);
    }
  }

  if (sessions.length === 0) {
    return (
      <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-10 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-[#F4F7FB] text-[#94A3B8] flex items-center justify-center">
          <StickyNote className="w-5.5 h-5.5" />
        </div>
        <p className="text-sm text-[#94A3B8] font-semibold">אין שיחות זמינות להוספת הערות</p>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-4">
        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-wide mb-3 px-1">בחר שיחה</p>
        <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`w-full text-right px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                selectedId === s.id ? "bg-blue-50 text-blue-700" : "text-[#64748B] hover:bg-[#F4F7FB]"
              }`}
            >
              {s.customerName ?? "לקוח"}
              <span className="block text-[11px] font-semibold text-[#94A3B8]">{formatTime(s.createdAt)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="md:col-span-2 bg-white border border-[#E2E8F0] rounded-[20px] p-5 flex flex-col">
        <h2 className="text-sm font-black text-[#0F172A] mb-4">הערות טיפול</h2>

        <div className="flex-1 space-y-3 mb-4 max-h-[340px] overflow-y-auto">
          {loaded && notes.length === 0 && (
            <p className="text-sm text-[#94A3B8] font-semibold text-center py-8">אין הערות להצגה</p>
          )}
          {notes.map((note) => (
            <div key={note.id} className="bg-[#F4F7FB] border border-[#E2E8F0] rounded-xl p-3">
              <p className="text-sm text-[#0F172A] font-medium leading-relaxed">{note.content}</p>
              <p className="text-[11px] text-[#94A3B8] font-semibold mt-1.5">
                {note.authorName ?? "נציג"} · {formatTime(note.createdAt)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            placeholder="הוסף הערה פנימית..."
            className="flex-1 h-11 bg-[#F4F7FB] border border-[#E2E8F0] focus:border-blue-600/50 rounded-xl px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors"
          />
          <button
            onClick={handleAddNote}
            className="w-11 h-11 flex items-center justify-center bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all shrink-0 shadow-sm"
            aria-label="הוספה"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
