import { Wifi } from "lucide-react";
import ComingSoonButton from "./ComingSoonButton";
import { relativeTimeFromNow } from "@/lib/support-labels";

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  TEAMVIEWER: "TeamViewer",
  ANYDESK: "AnyDesk",
};

const CONNECTION_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין לאישור",
  ACCEPTED: "מחובר",
  DECLINED: "נדחה",
  EXPIRED: "פג תוקף",
};

const CONNECTION_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  DECLINED: "bg-red-50 text-red-600 border-red-100",
  EXPIRED: "bg-slate-100 text-slate-500 border-slate-200",
};

export type RemoteSession = {
  id: string;
  customerName: string | null;
  connectionType: string | null;
  connectionStatus: string | null;
  createdAt: Date;
};

export default function RemoteSupportCard({ sessions }: { sessions: RemoteSession[] }) {
  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <Wifi className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">טיפול מרחוק</h2>
      </div>

      {sessions.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5">
          <p className="text-sm font-medium text-[#64748B]">אין חיבורים מרחוק פעילים כרגע</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-[#E2E8F0]">
          {sessions.map((session) => (
            <li key={session.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0F172A]">{session.customerName || "לקוח לא ידוע"}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-medium">
                    {session.connectionType ? CONNECTION_TYPE_LABELS[session.connectionType] ?? session.connectionType : "לא צוין"}
                  </span>
                  {session.connectionStatus && (
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${CONNECTION_STATUS_STYLES[session.connectionStatus] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                    >
                      {CONNECTION_STATUS_LABELS[session.connectionStatus] ?? session.connectionStatus}
                    </span>
                  )}
                  <span>· {relativeTimeFromNow(session.createdAt)}</span>
                </div>
              </div>
              <ComingSoonButton
                label="פתיחה"
                message="מסך החיבור המרוחק יתווסף בהמשך"
                className="shrink-0 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
