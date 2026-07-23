"use client";

import { AlertCircle } from "lucide-react";
import SupportShell from "./SupportShell";

export default function SupportErrorState({
  userName,
  userRole,
}: {
  userName?: string | null;
  userRole?: string | null;
}) {
  return (
    <SupportShell userName={userName ?? null} userRole={userRole ?? null}>
      <div className="flex items-center justify-center py-16 md:py-24">
        <div className="w-full max-w-md rounded-[20px] border border-[#E2E8F0] bg-white p-8 text-center shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08),0_4px_6px_-4px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#EF4444]">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-[#0F172A]">לא ניתן לטעון את הנתונים כרגע</h1>
          <p className="mt-2 text-sm text-[#64748B]">נסה לרענן את העמוד בעוד מספר רגעים.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
          >
            רענון
          </button>
        </div>
      </div>
    </SupportShell>
  );
}
