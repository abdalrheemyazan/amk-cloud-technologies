import { Users } from "lucide-react";
import ComingSoonButton from "./ComingSoonButton";
import { relativeTimeFromNow } from "@/lib/support-labels";

export type WaitingCustomer = {
  id: string;
  customerName: string | null;
  createdAt: Date;
};

export default function WaitingCustomersCard({ customers }: { customers: WaitingCustomer[] }) {
  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <Users className="w-4.5 h-4.5 text-[#2563EB]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[#0F172A]">לקוחות שממתינים לטכנאי</h2>
      </div>

      {customers.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5">
          <p className="text-sm font-medium text-[#64748B]">אין לקוחות שממתינים כרגע</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-[#E2E8F0]">
          {customers.map((customer) => (
            <li key={customer.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0F172A]">
                  {customer.customerName || "לקוח לא ידוע"}
                </p>
                <p className="mt-0.5 text-xs text-[#64748B]">ממתין {relativeTimeFromNow(customer.createdAt)}</p>
              </div>
              <ComingSoonButton
                label="קבלת טיפול"
                message="קבלת שיחה תתווסף בהמשך"
                className="shrink-0 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
