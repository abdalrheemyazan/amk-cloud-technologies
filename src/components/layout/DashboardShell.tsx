"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0F172A] flex selection:bg-blue-600/10 relative overflow-hidden">
      {/* Premium subtle radial SaaS backgrounds */}
      <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-gradient-to-br from-[#EEF4FF]/40 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-gradient-to-tr from-[#F1F5F9]/50 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      <Sidebar />
      <main className="flex-1 py-4 px-4 md:py-6 md:pl-6 md:pr-5 min-h-screen relative z-10 w-full mr-[270px]">
        {children}
      </main>
    </div>
  );
}
