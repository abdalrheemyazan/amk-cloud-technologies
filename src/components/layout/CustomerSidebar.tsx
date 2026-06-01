"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  Settings,
  User,
  LogOut,
  Cloud,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

const navigationSections = [
  {
    title: "MAIN",
    items: [
      { title: "הבית שלי", href: "/portal", icon: LayoutDashboard },
      { title: "פתיחת קריאה", href: "/portal/tickets/new", icon: PlusCircle },
      { title: "הקריאות שלי", href: "/portal/tickets", icon: Ticket },
      { title: "מאגר ידע", href: "/portal/knowledge-base", icon: BookOpen },
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { title: "הפרופיל שלי", href: "/portal/profile", icon: User },
      { title: "הגדרות חשבון", href: "/portal/settings", icon: Settings },
    ]
  }
];

export default function CustomerSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className="h-screen fixed top-0 right-0 border-l border-slate-200/70 bg-white flex flex-col z-[100] w-[270px] overflow-hidden select-none text-right shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      dir="rtl"
    >
      {/* Header */}
      <div className="py-5 px-4.5 border-b border-slate-100 flex flex-col gap-2.5 text-right relative z-10 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <Cloud className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm font-black tracking-tight text-slate-900 leading-none">
                AMK <span className="text-blue-600 font-extrabold">Portal</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                פורטל לקוחות
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Space */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/portal" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-semibold group text-right text-[12px] border border-transparent",
                      isActive
                        ? "text-blue-700 bg-blue-50/50 border-blue-100/50 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 flex items-center justify-center transition-all shrink-0",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>

                    <span className="tracking-tight flex-1">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Customer Profile */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 text-right mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200 shrink-0">
            {session?.user?.name?.[0] || "C"}
          </div>

          <div className="flex flex-col text-right flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">
              {session?.user?.name || "לקוח"}
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              {session?.user?.email}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          התנתקות
        </button>
      </div>
    </aside>
  );
}
