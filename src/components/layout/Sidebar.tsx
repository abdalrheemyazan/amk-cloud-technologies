"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  AlertTriangle,
  Settings,
  LogOut,
  Cloud,
  Sparkles,
  Laptop,
  Lock,
  RefreshCw,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [stats, setStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  const role = (session?.user as any)?.role || "CUSTOMER";

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Track hash for active state of anchor links (e.g. #alerts)
    setCurrentHash(window.location.hash);
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  const navigationSections = [
    {
      title: "MAIN",
      items: [
        { title: "סקירה כללית", href: "/dashboard", icon: LayoutDashboard },
        { title: "קריאות שירות", href: "/tickets", icon: Ticket },
        { title: "מאגר ידע", href: "/knowledge-base", icon: BookOpen },
      ]
    },
    {
      title: "OPERATIONS",
      items: [
        { title: "התראות", href: "/alerts", icon: AlertTriangle },
        { title: "גישה מרחוק", href: "/remote-support", icon: Laptop },
      ]
    },
    {
      title: "AI",
      items: [
        { title: "AI Assistant", href: "/ai-assistant", icon: Sparkles, ai: true },
      ]
    },
    {
      title: "SYSTEM",
      items: [
        ...(role === "ADMINISTRATOR" || role === "TEAM_LEADER" ? [{ title: "אבטחה", href: "/security", icon: Lock }] : []),
        { title: "הגדרות", href: "/settings", icon: Settings },
      ]
    }
  ];

  return (
    <aside
      className="h-screen fixed top-0 right-0 border-l border-slate-200/70 bg-gradient-to-b from-[#F8FAFC] via-[#F4F7FB]/95 to-[#E2E8F0]/30 backdrop-blur-lg flex flex-col z-[100] w-[270px] overflow-hidden select-none text-right shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      dir="rtl"
    >
      {/* Glow Effect Top Header */}
      <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      {/* Futuristic Compact Top Header */}
      <div className="py-4 px-4.5 border-b border-slate-200/50 flex flex-col gap-2.5 text-right relative z-10 bg-white/40 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/15 flex-shrink-0">
              <Cloud className="text-white w-4 h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[11.5px] font-black tracking-tight text-slate-900 leading-none">
                AMK <span className="text-blue-600 font-extrabold">Cloud Technologies</span>
              </span>
              <span className="text-[7.5px] font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                Control Center • Cloud Operations
              </span>
            </div>
          </div>

          {/* Glowing Online status badge */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 text-[8px] font-black tracking-wider shadow-[0_1px_2px_rgba(16,185,129,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            ONLINE
          </span>
        </div>

        {/* Technical Sub-metadata info */}
        <div className="flex items-center justify-between text-[8px] font-bold text-slate-450 border-t border-slate-100/60 pt-2">
          <span className="flex items-center gap-1">
            <Server className="w-2.5 h-2.5 text-slate-400" />
            סביבה: <span className="text-slate-700">PRODUCTION</span>
          </span>
          <span className="text-blue-600 uppercase font-black tracking-wider">IL-CENTER-1</span>
        </div>
      </div>

      {/* Navigation Space */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-4">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              {section.title}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isHashLink = item.href.includes("#");
                const [itemPath, itemHash] = item.href.split("#");
                
                let isActive = false;
                
                if (isHashLink) {
                  isActive = pathname === itemPath && currentHash === `#${itemHash}`;
                } else {
                  // For normal links without hash, ensure they are not highlighted if a hash link is active
                  isActive = (pathname === item.href && currentHash === "") || 
                             (item.href !== "/dashboard" && pathname.startsWith(item.href) && currentHash === "");
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isHashLink) {
                        setCurrentHash(`#${itemHash}`);
                      } else {
                        setCurrentHash("");
                      }
                    }}
                    className={cn(
                      "relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 font-bold group text-right text-[11px] border border-transparent",
                      isActive
                        ? "text-blue-700 bg-blue-50/50 border-blue-200/40 shadow-[0_2px_6px_rgba(37,99,235,0.03)]"
                        : "text-slate-650 hover:text-slate-900 hover:bg-slate-200/30 hover:scale-[1.01]"
                    )}
                  >
                    {/* Glowing Left Indicator Strip */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-600 rounded-r shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                    )}

                    <div className={cn(
                      "w-4.5 h-4.5 flex items-center justify-center transition-all shrink-0",
                      isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-800"
                    )}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex flex-1 items-center justify-between">
                      <span className="tracking-tight">{item.title}</span>
                      {(item as any).ai && (
                        <div className="px-1.5 py-[1px] rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-[7px] font-black text-white flex items-center gap-1 shadow-sm">
                          AI
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* NOC Live Telemetry Block */}
        <div className="pt-2">
          <div className="bg-white/40 border border-slate-250/50 rounded-xl p-3 text-right shadow-[0_1px_3px_rgba(0,0,0,0.01)] backdrop-blur-sm">
            <div className="flex justify-between items-center text-[7.5px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-2">
              <span>טלמטריית NOC בזמן אמת</span>
              <button 
                onClick={fetchStats}
                className="flex items-center gap-1 text-[7.5px] text-blue-600 hover:text-blue-700 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded shadow-sm transition-colors"
              >
                <RefreshCw className={cn("w-2.5 h-2.5", isRefreshing && "animate-spin")} />
                רענון
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex flex-col p-1.5 bg-white/60 border border-slate-100 rounded-lg">
                <span className="text-slate-400 text-[8px] font-bold">קריאות פתוחות</span>
                <span className="font-extrabold text-slate-800 text-[11px] mt-0.5">{stats ? (stats.stats?.openTickets || 0) : "0"}</span>
              </div>
              <div className="flex flex-col p-1.5 bg-white/60 border border-slate-100 rounded-lg">
                <span className="text-slate-400 text-[8px] font-bold">התראות פעילות</span>
                <span className="font-extrabold text-rose-600 text-[11px] mt-0.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                  {stats ? (stats.stats?.systemAlerts || 0) : "0"}
                </span>
              </div>
              <div className="flex flex-col p-1.5 bg-white/60 border border-slate-100 rounded-lg">
                <span className="text-slate-400 text-[8px] font-bold">טכנאים מחוברים</span>
                <span className="font-extrabold text-slate-800 text-[11px] mt-0.5">{stats ? (stats.stats?.activeTechnicians || 0) : "0"}</span>
              </div>
              <div className="flex flex-col p-1.5 bg-white/60 border border-slate-100 rounded-lg">
                <span className="text-slate-400 text-[8px] font-bold">SLA חודשי</span>
                <span className="font-extrabold text-emerald-600 text-[11px] mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  99.9%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Clean Operator Profile */}
      <div className="p-3 border-t border-slate-200/50 bg-[#F8FAFC]/50 backdrop-blur-md relative z-10">
        <div className="bg-gradient-to-br from-white to-blue-50/30 border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-3">
          
          {/* Top Row: Avatar & Info */}
          <div className="flex items-center gap-2.5 text-right">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-100 shadow-sm">
                {session?.user?.name?.[0] || "U"}
              </div>
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-[1.5px] border-white" />
            </div>

            <div className="flex flex-col text-right flex-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                {session?.user?.name || "מפעיל מערכת"}
              </span>
              <span className="text-[9px] text-slate-500 font-medium truncate mt-0.5">
                {session?.user?.email || "ops@amk-cloud.com"}
              </span>
            </div>
          </div>

          {/* Second Row: Badges */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[8px] font-bold text-blue-700 bg-blue-50/50 border border-blue-100/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
              {role}
            </span>
            <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50/50 border border-emerald-100/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
              AVAILABLE
            </span>
            <span className="text-[8px] font-mono font-medium text-slate-500 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded">
              WS-928
            </span>
          </div>

          {/* Bottom Row: Minimal Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-rose-600 transition-colors duration-150 mt-1"
          >
            <LogOut className="w-3 h-3" />
            התנתקות
          </button>
        </div>
      </div>
    </aside>
  );
}
