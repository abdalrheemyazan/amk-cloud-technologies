"use client";

import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

export default function SupportHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] md:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#EFF6FF] via-white to-white opacity-80"
      />

      <div className="relative flex items-start gap-4">
        <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
          <Wrench className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            לוח טכנאי
          </h1>
          <p className="mt-1.5 max-w-xl text-sm md:text-base text-[#64748B]">
            ניהול משימות טיפול, חיבורים מרחוק וסיוע מהיר ללקוחות.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
