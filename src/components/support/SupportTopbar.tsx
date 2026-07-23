"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import RefreshDataButton from "./RefreshDataButton";
import TechnicianStatusSelector, { type TechnicianStatusValue } from "./TechnicianStatusSelector";
import { ROLE_LABELS } from "@/lib/support-labels";

export default function SupportTopbar({
  userName,
  userRole,
  status,
  onStatusChange,
}: {
  userName: string | null;
  userRole: string | null;
  status: TechnicianStatusValue;
  onStatusChange: (value: TechnicianStatusValue) => void;
}) {
  const roleLabel = userRole ? ROLE_LABELS[userRole] ?? userRole : null;
  const initials = (userName ?? "AMK")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-bold text-[#0F172A]">{userName ?? "משתמש"}</p>
          {roleLabel && <p className="truncate text-xs font-medium text-[#64748B]">{roleLabel}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <TechnicianStatusSelector value={status} onChange={onStatusChange} />

        <button
          type="button"
          aria-label="התראות"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition-colors duration-200 ease-out hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
        >
          <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        </button>

        <RefreshDataButton className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#0F172A] transition-colors duration-200 ease-out hover:bg-[#F8FAFC] hover:border-[#CBD5E1] disabled:opacity-60" />
      </div>
    </motion.div>
  );
}
