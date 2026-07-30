"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Check, ListFilter, Search, ShieldCheck } from "lucide-react";
import type { PriorityRequest } from "@/lib/actions/support-dashboard-actions";
import {
  AssignmentBadge,
  formatWaiting,
  PriorityBadge,
  SlaBadge,
} from "./priority-presentation";

type FilterKey = "ALL" | "CRITICAL" | "HIGH" | "UNASSIGNED" | "SLA_RISK" | "NEEDS_RESPONSE";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "הכול" },
  { key: "CRITICAL", label: "קריטי" },
  { key: "HIGH", label: "גבוה" },
  { key: "UNASSIGNED", label: "לא משויך" },
  { key: "SLA_RISK", label: "SLA בסיכון" },
  { key: "NEEDS_RESPONSE", label: "ממתין לתגובה" },
];

const INITIAL_VISIBLE = 12;

function matchesFilter(request: PriorityRequest, filter: FilterKey): boolean {
  switch (filter) {
    case "CRITICAL":
      return request.level === "CRITICAL";
    case "HIGH":
      return request.level === "HIGH";
    case "UNASSIGNED":
      return request.assignment === "UNASSIGNED";
    case "SLA_RISK":
      return request.slaRisk === "BREACHED" || request.slaRisk === "AT_RISK";
    case "NEEDS_RESPONSE":
      return request.awaitingStaff;
    default:
      return true;
  }
}

function formatLastActivity(iso: string): string {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

export default function PriorityQueue({
  requests,
  loaded,
  onAccept,
  onOpenChat,
}: {
  requests: PriorityRequest[];
  loaded: boolean;
  onAccept: (id: string) => void;
  onOpenChat: (id: string) => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (!matchesFilter(request, filter)) return false;
      if (!term) return true;
      const haystack = [request.customerName, request.subject, request.category, request.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [requests, filter, search]);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.75)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-blue-600" aria-hidden="true" />
          <h2 className="text-sm font-black text-slate-950">בקשות בעדיפות גבוהה</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {filtered.length}
          </span>
        </div>
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="sr-only">חיפוש לפי לקוח, נושא או מספר פנייה</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="חיפוש לפי לקוח, נושא או מספר פנייה"
            className="h-8 w-full min-w-[200px] rounded-lg border border-slate-200 bg-slate-50 pr-8 pl-3 text-[11px] font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-64"
          />
        </label>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 px-3 py-2">
        <ListFilter className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        {FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilter(item.key);
                setShowAll(false);
              }}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {loaded && filtered.length === 0 && (
        <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
          <ShieldCheck className="h-8 w-8 text-slate-300" aria-hidden="true" />
          <p className="mt-3 text-xs font-black text-slate-600">אין בקשות בעדיפות גבוהה כרגע</p>
          <p className="mt-1 max-w-xs text-[10px] leading-4 text-slate-400">
            כל הפניות הפתוחות מטופלות. פניות חדשות יופיעו כאן לפי סדר חשיבות.
          </p>
        </div>
      )}

      {!loaded && requests.length === 0 && (
        <div className="space-y-2 p-3" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <th scope="col" className="px-4 py-2 font-bold">לקוח</th>
                  <th scope="col" className="px-3 py-2 font-bold">שירות / נושא</th>
                  <th scope="col" className="px-3 py-2 font-bold">עדיפות</th>
                  <th scope="col" className="px-3 py-2 font-bold">זמן המתנה</th>
                  <th scope="col" className="px-3 py-2 font-bold">סיכון SLA</th>
                  <th scope="col" className="px-3 py-2 font-bold">סטטוס שיוך</th>
                  <th scope="col" className="px-3 py-2 font-bold">פעילות אחרונה</th>
                  <th scope="col" className="px-4 py-2 font-bold">פעולה</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((request) => (
                  <tr key={request.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60">
                    <td className="px-4 py-2.5">
                      <span className="block truncate text-xs font-black text-slate-900">
                        {request.customerName || "לקוח/ה"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block max-w-[220px] truncate text-[11px] font-semibold text-slate-500">
                        {request.category || "תמיכה כללית"}
                        {request.subject ? ` · ${request.subject}` : ""}
                      </span>
                    </td>
                    <td className="px-3 py-2.5"><PriorityBadge level={request.level} /></td>
                    <td className="px-3 py-2.5 text-[11px] font-bold text-slate-600">
                      {formatWaiting(request.waitingMinutes)}
                    </td>
                    <td className="px-3 py-2.5"><SlaBadge risk={request.slaRisk} /></td>
                    <td className="px-3 py-2.5"><AssignmentBadge assignment={request.assignment} /></td>
                    <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-400">
                      {formatLastActivity(request.lastActivityAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <QueueAction request={request} onAccept={onAccept} onOpenChat={onOpenChat} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <ul className="space-y-2 p-3 lg:hidden">
            {visible.map((request) => (
              <li key={request.id} className="rounded-[14px] border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-900">
                      {request.customerName || "לקוח/ה"}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
                      {request.category || "תמיכה כללית"}
                      {request.subject ? ` · ${request.subject}` : ""}
                    </p>
                  </div>
                  <PriorityBadge level={request.level} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <SlaBadge risk={request.slaRisk} />
                  <AssignmentBadge assignment={request.assignment} />
                  <span className="text-[10px] font-bold text-slate-500">
                    ממתין {formatWaiting(request.waitingMinutes)}
                  </span>
                </div>
                <div className="mt-2.5">
                  <QueueAction request={request} onAccept={onAccept} onOpenChat={onOpenChat} block />
                </div>
              </li>
            ))}
          </ul>

          {filtered.length > INITIAL_VISIBLE && (
            <div className="border-t border-slate-100 px-4 py-2.5 text-center">
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="text-[11px] font-extrabold text-blue-700 outline-none hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {showAll ? "הצג פחות" : `הצג הכל (${filtered.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function QueueAction({
  request,
  onAccept,
  onOpenChat,
  block = false,
}: {
  request: PriorityRequest;
  onAccept: (id: string) => void;
  onOpenChat: (id: string) => void;
  block?: boolean;
}) {
  const base = `inline-flex h-7 items-center justify-center gap-1.5 rounded-lg px-3 text-[10px] font-black outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
    block ? "w-full" : ""
  }`;

  if (request.assignment === "UNASSIGNED") {
    return (
      <button type="button" onClick={() => onAccept(request.id)} className={`${base} bg-blue-600 text-white hover:bg-blue-700`}>
        <Check className="h-3 w-3" aria-hidden="true" />
        קבלת טיפול
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpenChat(request.id)}
      className={`${base} border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700`}
    >
      {request.assignment === "MINE" ? "המשך טיפול" : "פתח"}
    </button>
  );
}
