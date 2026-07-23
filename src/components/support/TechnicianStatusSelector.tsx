"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "זמין", dot: "bg-[#10B981]" },
  { value: "BUSY", label: "בטיפול", dot: "bg-[#2563EB]" },
  { value: "BREAK", label: "בהפסקה", dot: "bg-[#F59E0B]" },
  { value: "UNAVAILABLE", label: "לא זמין", dot: "bg-[#94A3B8]" },
] as const;

export type TechnicianStatusValue = (typeof STATUS_OPTIONS)[number]["value"];

export default function TechnicianStatusSelector({
  value,
  onChange,
}: {
  value: TechnicianStatusValue;
  onChange: (value: TechnicianStatusValue) => void;
}) {
  const [open, setOpen] = useState(false);

  const current = STATUS_OPTIONS.find((opt) => opt.value === value) ?? STATUS_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="עדכון מקומי בלבד - טרם מחובר למערכת"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-sm font-semibold text-[#0F172A] transition-colors duration-200 ease-out hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${current.dot}`} aria-hidden="true" />
        {current.label}
        <ChevronDown className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            className="absolute left-0 top-[calc(100%+6px)] z-20 w-40 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white py-1 shadow-lg"
          >
            {STATUS_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3.5 py-2 text-right text-sm font-medium transition-colors hover:bg-[#F8FAFC] ${
                    opt.value === value ? "text-[#2563EB]" : "text-[#0F172A]"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${opt.dot}`} aria-hidden="true" />
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
