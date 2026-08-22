"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Inbox,
  PlusCircle,
  Search,
} from "lucide-react";
import type { MyRequestSummary } from "@/lib/actions/support-chat-actions";
import CustomerPortalPageShell from "./CustomerPortalPageShell";
import CustomerRequestsList from "./CustomerRequestsList";
import CustomerTicketDetailsDrawer from "./CustomerTicketDetailsDrawer";

type TabKey = "ALL" | "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED";

export default function CustomerRequestsSection({
  requests,
  loaded,
  onOpenRequest,
  onCancelled,
}: {
  requests: MyRequestSummary[];
  loaded: boolean;
  onOpenRequest: (id: string) => void;
  onCancelled: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localTicketId, setLocalTicketId] = useState<string | null>(null);
  const activeTicketId = searchParams.get("request") || localTicketId;
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  function handleOpen(id: string) {
    setLocalTicketId(id);
    router.replace(`/portal/requests?request=${encodeURIComponent(id)}`, { scroll: false });
    onOpenRequest?.(id);
  }

  function handleClose() {
    setLocalTicketId(null);
    router.replace("/portal/requests", { scroll: false });
  }

  const inProgressCount = requests.filter((r) => ["ACTIVE", "IN_PROGRESS"].includes(r.status)).length;
  const waitingCount = requests.filter((r) => ["WAITING_FOR_CUSTOMER", "WAITING_CUSTOMER"].includes(r.status)).length;
  const resolvedCount = requests.filter((r) => ["RESOLVED", "CLOSED"].includes(r.status)).length;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of requests) {
      if (r.category) set.add(r.category);
    }
    return Array.from(set);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Tab filter
      if (activeTab === "OPEN" && !["NEW", "PENDING", "OPEN"].includes(r.status)) return false;
      if (activeTab === "IN_PROGRESS" && !["ACTIVE", "IN_PROGRESS"].includes(r.status)) return false;
      if (activeTab === "WAITING" && !["WAITING_FOR_CUSTOMER", "WAITING_CUSTOMER", "WAITING_INTERNAL"].includes(r.status)) return false;
      if (activeTab === "RESOLVED" && !["RESOLVED", "CLOSED", "CANCELLED"].includes(r.status)) return false;

      // Category filter
      if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subjectMatch = r.subject?.toLowerCase().includes(q);
        const categoryMatch = r.category?.toLowerCase().includes(q);
        const idMatch = r.id.toLowerCase().includes(q);
        if (!subjectMatch && !categoryMatch && !idMatch) return false;
      }

      return true;
    });
  }, [requests, activeTab, categoryFilter, searchQuery]);

  return (
    <CustomerPortalPageShell
      title="הפניות שלי"
      description="כל הפניות שפתחת מול צוות התמיכה של AMK, עם סטטוס והיסטוריית טיפול."
      eyebrow="מרכז הפניות"
      icon={Inbox}
      tone="indigo"
      badge={loaded ? `${requests.length} פניות בסה״כ` : "טוען נתונים"}
      actions={
        <Link
          href="/portal/new-request"
          prefetch={true}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white transition-colors hover:bg-indigo-700 shadow-sm"
        >
          <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
          פתיחת פנייה חדשה
        </Link>
      }
    >
      <div className="space-y-4">
        {/* KPI Mini-Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`p-3 rounded-2xl border text-right transition-all ${
              activeTab === "ALL"
                ? "border-blue-500 bg-blue-50/70 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <p className="text-[10px] font-black text-slate-500">כל הפניות</p>
            <p className="text-xl font-black text-slate-900 mt-1 tabular-nums">{requests.length}</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("IN_PROGRESS")}
            className={`p-3 rounded-2xl border text-right transition-all ${
              activeTab === "IN_PROGRESS"
                ? "border-emerald-500 bg-emerald-50/70 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <p className="text-[10px] font-black text-emerald-700">בטיפול פעיל</p>
            <p className="text-xl font-black text-emerald-950 mt-1 tabular-nums">{inProgressCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("WAITING")}
            className={`p-3 rounded-2xl border text-right transition-all ${
              activeTab === "WAITING"
                ? "border-purple-500 bg-purple-50/70 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <p className="text-[10px] font-black text-purple-700">ממתינות לתשובתך</p>
            <p className="text-xl font-black text-purple-950 mt-1 tabular-nums">{waitingCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RESOLVED")}
            className={`p-3 rounded-2xl border text-right transition-all ${
              activeTab === "RESOLVED"
                ? "border-indigo-500 bg-indigo-50/70 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <p className="text-[10px] font-black text-indigo-700">נפתרו ונסגרו</p>
            <p className="text-xl font-black text-indigo-950 mt-1 tabular-nums">{resolvedCount}</p>
          </button>
        </div>

        {/* Filter controls & Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`rounded-xl px-3 py-1.5 font-black transition-all ${
                activeTab === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              הכל
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("OPEN")}
              className={`rounded-xl px-3 py-1.5 font-black transition-all ${
                activeTab === "OPEN" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              חדשות
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("IN_PROGRESS")}
              className={`rounded-xl px-3 py-1.5 font-black transition-all ${
                activeTab === "IN_PROGRESS" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              בטיפול
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("WAITING")}
              className={`rounded-xl px-3 py-1.5 font-black transition-all ${
                activeTab === "WAITING" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              ממתינות
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("RESOLVED")}
              className={`rounded-xl px-3 py-1.5 font-black transition-all ${
                activeTab === "RESOLVED" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              נפתרו/נסגרו
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="ALL">כל הקטגוריות</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש לפי נושא או מזהה..."
                className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 pr-8 pl-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <section className="min-w-0 rounded-[22px] border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <CustomerRequestsList
            requests={filteredRequests}
            loaded={loaded}
            onOpenRequest={handleOpen}
            onCancelled={onCancelled}
          />
        </section>

        {activeTicketId && (
          <CustomerTicketDetailsDrawer
            ticketId={activeTicketId}
            onClose={handleClose}
            onUpdated={onCancelled}
          />
        )}
      </div>
    </CustomerPortalPageShell>
  );
}
