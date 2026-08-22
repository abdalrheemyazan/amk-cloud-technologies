"use client";

import { useState } from "react";
import {
  Activity,
  AlertCircle,
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  HelpCircle,
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
  "תקציר הפנייה",
  "סיכום התקלה",
  "אבחון אפשרי וסיבת שורש",
  "אבחון אפשרי",
  "מה כבר נוסה ונבדק",
  "מה כבר נוסה",
  "מידע חסר הדורש בירור",
  "מידע חסר",
  "בדיקות מומלצות",
  "פתרון מוצע",
  "רמת סיכון",
  "שאלות המשך ללקוח",
  "שאלות נוספות ללקוח",
  "תגובה מוצעת ללקוח",
  "מקורות",
  "רמת ודאות",
] as const;

const REPLY_HEADERS = ["תגובה מוצעת ללקוח", "נוסח מוצע ללקוח", "טיוטת מענה"];

const QUICK_ACTIONS: { action: SupportAiAction; label: string; icon: typeof Sparkles }[] = [
  { action: "diagnose", label: "נתח תקלה", icon: Stethoscope },
  { action: "summary", label: "סכם שיחה", icon: BookOpen },
  { action: "already_tried", label: "מה נוסה?", icon: CheckCircle2 },
  { action: "checks", label: "הצע בדיקות", icon: ListChecks },
  { action: "solution", label: "הצע פתרון", icon: Wrench },
  { action: "reply", label: "נסח תשובה", icon: PencilLine },
  { action: "followup_questions", label: "שאלות המשך", icon: HelpCircle },
  { action: "missing_info", label: "מידע חסר", icon: AlertCircle },
  { action: "root_cause", label: "סיבת שורש", icon: Activity },
];

type Entry = { id: string; label: string; result: SupportAiResult };

type ParsedSection = { header: string; body: string };

function parseSections(text: string): ParsedSection[] {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const line of lines) {
    const raw = line.trim().replace(/^[*#\s]+|[*#:\s]+$/g, "");
    const matched = SECTION_HEADERS.find((header) => header === raw || raw.includes(header));
    if (matched) {
      current = { header: matched, body: "" };
      sections.push(current);
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    } else if (line.trim()) {
      current = { header: "", body: line };
      sections.push(current);
    }
  }
  return sections.map((section) => ({ header: section.header, body: section.body.trim() }));
}

function extractReply(text: string): string {
  const sections = parseSections(text);
  const found = sections.find((s) => REPLY_HEADERS.some((h) => s.header.includes(h)));
  return (found?.body || text).trim();
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
      setError(
        result.error === "UNAUTHORIZED" || result.error === "NOT_FOUND"
          ? "אין הרשאה לנתח פנייה זו."
          : result.error,
      );
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
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-black text-slate-950">עוזר AI טכני</h2>
            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-black text-blue-700">
              Copilot
            </span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500">אבחון תקלה, מה נוסה והצעת פתרונות</p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-start gap-2 border-b border-amber-100 bg-amber-50/70 px-4 py-2">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
        <p className="text-[10px] font-semibold leading-4 text-amber-800">
          העוזר מציע צעדים וטיוטות מענה בלבד. הנציג בודק ומאשר לפני ביצוע או שליחה.
        </p>
      </div>

      {sessionLabel && (
        <p className="border-b border-slate-100 px-4 py-1.5 text-[10px] font-bold text-slate-400">
          פנייה פעילה: <span className="text-slate-700 font-black">{sessionLabel}</span>
        </p>
      )}

      {/* Quick Action Pills Bar */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-3 py-2.5 bg-slate-50/50">
        {QUICK_ACTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.action}
              type="button"
              disabled={disabled}
              onClick={() => run(item.action)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-700 outline-none transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs"
            >
              <Icon className="h-3 w-3 text-blue-600" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Output Stream / Feed */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/40 p-3">
        {!sessionId && (
          <div className="flex min-h-[160px] flex-col items-center justify-center px-4 text-center">
            <Sparkles className="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="mt-3 text-xs font-black text-slate-600">בחרו פנייה פעילה לניתוח</p>
            <p className="mt-1 max-w-xs text-[10px] leading-4 text-slate-400">
              פתחו שיחה מהתור והעוזר ינתח את ההקשר, השיחה והידע הפנימי.
            </p>
          </div>
        )}

        {sessionId && entries.length === 0 && !loading && !error && (
          <div className="flex min-h-[160px] flex-col items-center justify-center px-4 text-center">
            <Bot className="h-8 w-8 text-blue-300" aria-hidden="true" />
            <p className="mt-3 text-xs font-black text-slate-700">העוזר מוכן לסייע</p>
            <p className="mt-1 max-w-xs text-[10px] leading-4 text-slate-500 font-medium">
              לחצו על אחד מכפתורי הפעולה למעלה (כגון &quot;נתח תקלה&quot; או &quot;מה נוסה?&quot;) או הקלידו שאלה חופשית.
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
            מנתח את הפנייה מול מאגר הידע...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-[11px] font-bold text-red-700 leading-relaxed"
          >
            {error}
          </div>
        )}
      </div>

      {/* Free-form input */}
      <div className="flex items-center gap-2 border-t border-slate-100 p-2.5 bg-white">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSubmitInput();
          }}
          disabled={disabled}
          placeholder="שאל שאלה חופשית או הוסף ממצאים..."
          className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSubmitInput}
          disabled={disabled || !input.trim()}
          aria-label="שליחה לעוזר AI"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
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
  const hasReply = sections.some((section) =>
    REPLY_HEADERS.some((h) => section.header.includes(h)),
  );

  return (
    <article className="rounded-[16px] border border-slate-200 bg-white p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
          <span className="text-[11px] font-black text-blue-700">{entry.label}</span>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {sections.map((section, index) => (
          <div key={`${section.header}-${index}`} className="space-y-1">
            {section.header && (
              <p className="text-[11px] font-black text-slate-900 border-r-2 border-blue-600 pr-1.5">
                {section.header}
              </p>
            )}
            <div className="space-y-1">
              {section.body.split("\n").map((line, lineIndex) => {
                const isWarning = line.includes("⚠️") || line.includes("אזהרה:");
                return (
                  <p
                    key={lineIndex}
                    className={
                      isWarning
                        ? "rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[11px] font-bold leading-relaxed text-amber-900"
                        : "whitespace-pre-wrap text-[11px] font-medium leading-relaxed text-slate-700"
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
      <div className="border-t border-slate-100 pt-2.5">
        <p className="mb-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
          מקורות ידע פנימיים
        </p>
        {entry.result.sources.length > 0 ? (
          <ul className="space-y-1">
            {entry.result.sources.map((source, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-1.5 text-[10px] font-semibold text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <BookOpen className="h-3 w-3 shrink-0 text-blue-600" aria-hidden="true" />
                  <span className="truncate">
                    {source.title}
                    {source.pageNumber ? ` · עמ׳ ${source.pageNumber}` : ""}
                  </span>
                </div>
                <span className="shrink-0 rounded bg-blue-100/60 px-1 text-[9px] font-black text-blue-800">
                  {Math.round(source.similarity * 100)}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[10px] font-semibold text-slate-400">לא נעשה שימוש במסמכי ידע חיצוניים.</p>
        )}
      </div>

      {/* Reply actions */}
      {hasReply && (
        <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5">
          <button
            type="button"
            onClick={onCopyReply}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-black text-white outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 shadow-2xs"
          >
            {copied ? (
              <ClipboardCheck className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? "הוכנס לתיבת ההודעה!" : "הכנס לתיבת ההודעה"}
          </button>
          <button
            type="button"
            onClick={onEditReply}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-700 outline-none hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
            ערוך טיוטה
          </button>
        </div>
      )}
    </article>
  );
}
