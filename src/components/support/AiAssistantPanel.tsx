"use client";

import { useState } from "react";
import {
  BookOpen,
  Bot,
  ClipboardCheck,
  Copy,
  ListChecks,
  Loader2,
  PencilLine,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react";
import {
  analyzeSupportRequest,
  type SupportAiAction,
  type SupportAiResult,
} from "@/lib/actions/support-ai-actions";

const SECTION_HEADERS = [
  "סיכום התקלה",
  "אבחון אפשרי",
  "בדיקות מומלצות",
  "פתרון מוצע",
  "רמת סיכון",
  "שאלות נוספות ללקוח",
  "תגובה מוצעת ללקוח",
  "מקורות",
  "רמת ודאות",
] as const;

const REPLY_HEADER = "תגובה מוצעת ללקוח";

const QUICK_ACTIONS: { action: SupportAiAction; label: string; icon: typeof Sparkles }[] = [
  { action: "diagnose", label: "נתח את התקלה", icon: Stethoscope },
  { action: "checks", label: "הצע בדיקות", icon: ListChecks },
  { action: "solution", label: "הצע פתרון", icon: Wrench },
  { action: "reply", label: "נסח תשובה ללקוח", icon: PencilLine },
  { action: "summary", label: "סכם את השיחה", icon: BookOpen },
];

type Entry = { id: string; label: string; result: SupportAiResult };

type ParsedSection = { header: string; body: string };

function parseSections(text: string): ParsedSection[] {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim().replace(/[:：]\s*$/, "");
    const matched = SECTION_HEADERS.find((header) => trimmed === header || trimmed === `**${header}**`);
    if (matched) {
      current = { header: matched, body: "" };
      sections.push(current);
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    } else if (line.trim()) {
      // Preamble before the first header — keep it as an untitled block.
      current = { header: "", body: line };
      sections.push(current);
    }
  }
  return sections.map((section) => ({ header: section.header, body: section.body.trim() }));
}

function extractReply(text: string): string {
  const section = parseSections(text).find((entry) => entry.header === REPLY_HEADER);
  return (section?.body || text).trim();
}

export default function AiAssistantPanel({
  sessionId,
  sessionLabel,
  onCopyToReply,
}: {
  sessionId: string | null;
  sessionLabel?: string | null;
  onCopyToReply: (text: string) => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const disabled = !sessionId || loading;

  async function run(action: SupportAiAction, agentInput?: string) {
    if (!sessionId || loading) return;
    setLoading(true);
    setError(null);
    const label = QUICK_ACTIONS.find((item) => item.action === action)?.label ?? "שאלה חופשית";
    const result = await analyzeSupportRequest({ sessionId, action, agentInput });
    if (result.ok) {
      setEntries((current) => [...current, { id: `${Date.now()}`, label, result: result.data }]);
    } else {
      setError(result.error === "UNAUTHORIZED" || result.error === "NOT_FOUND"
        ? "אין הרשאה לנתח פנייה זו."
        : result.error);
    }
    setLoading(false);
  }

  function handleSubmitInput() {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    setInput("");
    void run("custom", trimmed);
  }

  function copyReply(entry: Entry) {
    const reply = extractReply(entry.result.text);
    onCopyToReply(reply);
    setCopiedId(entry.id);
    window.setTimeout(() => setCopiedId((value) => (value === entry.id ? null : value)), 2500);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-slate-200/80 bg-white">
      {/* Header */}
      <div className="flex items-start gap-2.5 border-b border-slate-100 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-blue-600 text-white">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-slate-950">עוזר AI טכני</h2>
          <p className="text-[11px] font-semibold text-slate-500">סיוע באבחון ופתרון התקלה</p>
        </div>
      </div>

      {/* Safety notice */}
      <div className="flex items-start gap-2 border-b border-amber-100 bg-amber-50/70 px-4 py-2">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
        <p className="text-[10px] font-semibold leading-4 text-amber-800">
          העוזר מציע צעדים בלבד. אינו מבצע פעולות ואינו שולח תשובות ללקוח — הנציג בודק ושולח ידנית.
        </p>
      </div>

      {sessionLabel && (
        <p className="border-b border-slate-100 px-4 py-1.5 text-[10px] font-bold text-slate-400">
          פנייה: <span className="text-slate-600">{sessionLabel}</span>
        </p>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-3 py-2.5">
        {QUICK_ACTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.action}
              type="button"
              disabled={disabled}
              onClick={() => run(item.action)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Output */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/40 p-3">
        {!sessionId && (
          <div className="flex min-h-[160px] flex-col items-center justify-center px-4 text-center">
            <Sparkles className="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="mt-3 text-xs font-black text-slate-600">בחרו פנייה פעילה לניתוח</p>
            <p className="mt-1 max-w-xs text-[10px] leading-4 text-slate-400">
              פתחו שיחה פעילה ולחצו &quot;ניתוח בעזרת AI&quot; לקבלת ניתוח מלא עם הקשר הפנייה.
            </p>
          </div>
        )}

        {sessionId && entries.length === 0 && !loading && !error && (
          <div className="flex min-h-[160px] flex-col items-center justify-center px-4 text-center">
            <Bot className="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="mt-3 text-xs font-black text-slate-600">בחרו פעולה כדי להתחיל</p>
            <p className="mt-1 max-w-xs text-[10px] leading-4 text-slate-400">
              העוזר ינתח את התקלה על סמך פרטי הפנייה, השיחה ומאגר הידע הפנימי.
            </p>
          </div>
        )}

        {entries.map((entry) => (
          <AiResultCard
            key={entry.id}
            entry={entry}
            copied={copiedId === entry.id}
            onCopyReply={() => copyReply(entry)}
            onEditReply={() => copyReply(entry)}
          />
        ))}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs font-bold text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            מנתח את התקלה...
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-bold text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Free-form input */}
      <div className="flex items-center gap-2 border-t border-slate-100 p-2.5">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSubmitInput();
          }}
          disabled={disabled}
          placeholder="הוסף מידע, תוצאות בדיקה או שאלה ל-AI..."
          className="h-9 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSubmitInput}
          disabled={disabled || !input.trim()}
          aria-label="שליחה ל-AI"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function AiResultCard({
  entry,
  copied,
  onCopyReply,
  onEditReply,
}: {
  entry: Entry;
  copied: boolean;
  onCopyReply: () => void;
  onEditReply: () => void;
}) {
  const sections = parseSections(entry.result.text);
  const hasReply = sections.some((section) => section.header === REPLY_HEADER);

  return (
    <article className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-[0_6px_20px_-20px_rgba(15,23,42,0.75)]">
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-700">{entry.label}</span>
      </div>

      <div className="space-y-2.5">
        {sections.map((section, index) => (
          <div key={`${section.header}-${index}`}>
            {section.header && (
              <p className="text-[11px] font-black text-slate-900">{section.header}</p>
            )}
            <div className="mt-0.5 space-y-0.5">
              {section.body.split("\n").map((line, lineIndex) => {
                const isWarning = line.includes("⚠️");
                return (
                  <p
                    key={lineIndex}
                    className={
                      isWarning
                        ? "rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold leading-5 text-red-700"
                        : "whitespace-pre-wrap text-[11px] font-medium leading-5 text-slate-600"
                    }
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sources */}
      <div className="mt-3 border-t border-slate-100 pt-2">
        <p className="mb-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-400">מקורות ידע</p>
        {entry.result.sources.length > 0 ? (
          <ul className="space-y-1">
            {entry.result.sources.map((source, index) => (
              <li key={index} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <BookOpen className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="truncate">
                  {source.title}
                  {source.pageNumber ? ` · עמ׳ ${source.pageNumber}` : ""}
                </span>
                <span className="shrink-0 rounded bg-slate-100 px-1 text-[9px] font-bold text-slate-500">
                  {Math.round(source.similarity * 100)}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[10px] font-semibold text-amber-700">לא נמצא מידע מספיק במאגר הידע הפנימי.</p>
        )}
      </div>

      {/* Reply actions */}
      {hasReply && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5">
          <button
            type="button"
            onClick={onCopyReply}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-black text-white outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {copied ? <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? "הועתק לתיבת התגובה" : "העתק לתגובה"}
          </button>
          <button
            type="button"
            onClick={onEditReply}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-700 outline-none hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
            ערוך לפני שליחה
          </button>
        </div>
      )}
    </article>
  );
}
