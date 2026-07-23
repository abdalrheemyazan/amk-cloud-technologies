"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, CheckCircle2, LockKeyhole, UserRound, X } from "lucide-react";
import ModalPortal from "@/components/ui/ModalPortal";
import {
  transferSupportSession,
  type ConnectedSupportAgent,
} from "@/lib/actions/support-team-actions";
import type { ActiveChat } from "@/lib/actions/support-chat-actions";

export default function TransferIssueDialog({
  chat,
  agents,
  initialTargetId,
  onClose,
  onTransferred,
}: {
  chat: ActiveChat | null;
  agents: ConnectedSupportAgent[];
  initialTargetId?: string | null;
  onClose: () => void;
  onTransferred: (targetAgentName: string) => void;
}) {
  const transferTargets = useMemo(
    () => agents.filter((agent) => !agent.isCurrent && agent.status !== "OFFLINE"),
    [agents],
  );
  const [targetAgentId, setTargetAgentId] = useState(initialTargetId || "");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!chat) return null;

  async function submit() {
    if (!chat) return;
    if (!targetAgentId || submitting) return;
    setSubmitting(true);
    setError(null);

    const result = await transferSupportSession(chat.id, targetAgentId, note);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    onTransferred(result.data.targetAgentName);
  }

  const selectedAgent = transferTargets.find((agent) => agent.id === targetAgentId);

  return (
    <ModalPortal
      onClose={onClose}
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      labelledBy="transfer-dialog-title"
      rootClassName="items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      panelClassName="w-full max-w-lg overflow-hidden rounded-t-[24px] border border-slate-200 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.7)] sm:rounded-[24px]"
    >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-blue-700">
              <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="transfer-dialog-title" className="text-base font-black text-slate-950">
                העברת טיפול לנציג אחר
              </h2>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                הפנייה של {chat.customerName || "הלקוח/ה"} תעבור לבעלות הנציג שנבחר.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-modal-autofocus
            aria-label="סגירה"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="rounded-[14px] border border-blue-100 bg-blue-50/70 px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
              <div>
                <p className="text-xs font-black text-blue-950">העברת בעלות מיידית</p>
                <p className="mt-1 text-[10px] font-semibold leading-4 text-blue-700">
                  לאחר האישור, השיחה תינעל עבורך ותופיע מיד בתור הפעיל של הנציג החדש. הלקוח יקבל עדכון סטטוס מקצועי.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="transfer-agent" className="mb-2 block text-xs font-black text-slate-800">
              נציג יעד
            </label>
            <select
              id="transfer-agent"
              value={targetAgentId}
              onChange={(event) => setTargetAgentId(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">בחירת נציג מחובר...</option>
              {transferTargets.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} · {agent.specialty} · {agent.activeConversationCount} שיחות פעילות
                </option>
              ))}
            </select>
          </div>

          {selectedAgent && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#0B1739] text-white">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-slate-900">{selectedAgent.name}</p>
                <p className="truncate text-[10px] font-semibold text-slate-400">{selectedAgent.role} · {selectedAgent.specialty}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                מחובר
              </span>
            </div>
          )}

          <div>
            <label htmlFor="transfer-note" className="mb-2 block text-xs font-black text-slate-800">
              הערת העברה <span className="font-semibold text-slate-400">(אופציונלי)</span>
            </label>
            <textarea
              id="transfer-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="הקשר קצר, פעולות שכבר בוצעו ומה נדרש בהמשך..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold leading-5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {transferTargets.length === 0 && (
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] font-bold text-amber-800">
              אין כרגע נציג יעד מחובר. ניתן לפתוח שיחה פנימית עם ראש הצוות ולתאם הסלמה.
            </p>
          )}
          {error && <p className="text-[11px] font-bold text-rose-600">{error}</p>}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!targetAgentId || submitting}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            {submitting ? "מעביר טיפול..." : "אישור והעברת טיפול"}
          </button>
        </footer>
    </ModalPortal>
  );
}

