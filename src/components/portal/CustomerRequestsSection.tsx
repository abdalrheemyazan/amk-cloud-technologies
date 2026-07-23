import Link from "next/link";
import { Clock3, Inbox, PlusCircle } from "lucide-react";
import type { MyRequestSummary } from "@/lib/actions/support-chat-actions";
import CustomerPortalPageShell from "./CustomerPortalPageShell";
import CustomerRequestsList from "./CustomerRequestsList";

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
  const openCount = requests.filter((request) => request.status === "PENDING" || request.status === "ACTIVE").length;
  const waitingCount = requests.filter((request) => request.status === "PENDING").length;

  return (
    <CustomerPortalPageShell
      title="הפניות שלי"
      description="כל הפניות שפתחת מול צוות התמיכה של AMK, עם סטטוס והיסטוריית טיפול."
      eyebrow="מרכז הפניות"
      icon={Inbox}
      tone="indigo"
      badge={loaded ? `${requests.length} פניות אחרונות` : "טוען נתונים"}
      actions={
        <Link
          href="/portal/new-request"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white transition-colors hover:bg-indigo-700"
        >
          <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
          פתיחת פנייה
        </Link>
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <div className="rounded-[18px] border border-indigo-100 bg-indigo-50/70 p-4">
            <p className="text-[10px] font-black text-indigo-600">פניות בטיפול</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-indigo-950">{loaded ? openCount : "—"}</p>
          </div>
          <div className="rounded-[18px] border border-amber-100 bg-amber-50/70 p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              <p className="text-[10px] font-black">ממתינות לנציג</p>
            </div>
            <p className="mt-2 text-2xl font-black tabular-nums text-amber-950">{loaded ? waitingCount : "—"}</p>
          </div>
        </aside>

        <section className="min-w-0 rounded-[22px] border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-950">ציר הפניות</h2>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">לחיצה על פנייה פותחת את השיחה והעדכונים שלה.</p>
            </div>
          </div>
          <CustomerRequestsList requests={requests} loaded={loaded} onOpenRequest={onOpenRequest} onCancelled={onCancelled} />
        </section>
      </div>
    </CustomerPortalPageShell>
  );
}
