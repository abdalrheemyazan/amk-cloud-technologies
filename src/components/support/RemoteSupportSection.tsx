import RemoteSupportCard, { type RemoteSession } from "./RemoteSupportCard";
import WaitingCustomersCard, { type WaitingCustomer } from "./WaitingCustomersCard";
import ComingSoonButton from "./ComingSoonButton";

const QUICK_ACTIONS = ["פתיחת AnyDesk", "פתיחת TeamViewer", "שליחת קישור תמיכה"];

export default function RemoteSupportSection({
  sessions,
  waitingCustomers,
}: {
  sessions: RemoteSession[];
  waitingCustomers: WaitingCustomer[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
        <h2 className="mb-3 text-base font-bold text-[#0F172A]">פעולות מהירות</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <ComingSoonButton
              key={action}
              label={action}
              message="יתווסף בהמשך"
              className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-bold text-[#334155] transition-colors hover:border-[#CBD5E1]"
            />
          ))}
        </div>
      </section>

      <RemoteSupportCard sessions={sessions} />
      <WaitingCustomersCard customers={waitingCustomers} />
    </div>
  );
}
