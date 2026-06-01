"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Activity, ShieldAlert, Wifi, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PresenceData {
  status: string;
  currentTicketId?: string | null;
  currentSupportSessionId?: string | null;
  lastSeenAt: string;
}

interface Technician {
  id: string;
  name: string | null;
  email: string;
  presence?: PresenceData | null;
}

export default function TechnicianPresenceRail() {
  const { data: session } = useSession();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role;
  const isAuthorized = userRole === "ADMINISTRATOR" || userRole === "SUPPORT_AGENT";

  const fetchPresence = async () => {
    try {
      const res = await fetch("/api/technicians/presence");
      if (!res.ok) {
        throw new Error("כשל בטעינת סטטוס נוכחות");
      }
      const data = await res.json();
      if (data.success) {
        setTechnicians(data.technicians || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;

    fetchPresence();
    const interval = setInterval(fetchPresence, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthorized]);

  if (!isAuthorized) return null;

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "ONLINE":
      case "AVAILABLE":
        return {
          label: status === "ONLINE" ? "מחובר" : "זמין",
          dotClass: "bg-emerald-500",
          pulse: true,
          bgClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
      case "BUSY":
      case "IN_TICKET":
        return {
          label: status === "BUSY" ? "עסוק" : "בטיפול בקריאה",
          dotClass: "bg-amber-500",
          pulse: false,
          bgClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
      case "IN_REMOTE_SESSION":
        return {
          label: "בסשן מרוחק",
          dotClass: "bg-blue-500",
          pulse: false,
          bgClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
      case "OFFLINE":
      default:
        return {
          label: "לא מחובר",
          dotClass: "bg-zinc-400",
          pulse: false,
          bgClass: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/50",
        };
    }
  };

  return (
    <div className="w-80 shrink-0 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col gap-6" dir="rtl">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
          <h3 className="text-lg font-black text-slate-800">נוכחות טכנאים</h3>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchPresence(); }}
          className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
          title="רענן נוכחות"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && technicians.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">טוען נתוני נוכחות...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-xs font-bold text-slate-400">לא נמצאו טכנאים רשומים.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] p-0.5">
          <AnimatePresence>
            {technicians.map((tech) => {
              const status = tech.presence?.status || "OFFLINE";
              const config = getStatusConfig(status);

              return (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center font-black text-sm">
                          {tech.name ? tech.name.substring(0, 2) : "טכ"}
                        </div>
                        {/* Dot indicators */}
                        <div className="absolute -bottom-1 -left-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white border-2 border-white">
                          <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                          {config.pulse && (
                            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dotClass}`} />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="text-sm font-black text-slate-800 leading-tight">{tech.name || "טכנאי ללא שם"}</h4>
                        <span className="text-[10px] font-semibold text-slate-400">{tech.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${config.bgClass}`}>
                      {config.label}
                    </span>

                    {/* Show ticket / session indicators */}
                    {status === "IN_TICKET" && tech.presence?.currentTicketId && (
                      <span className="px-2 py-0.5 bg-amber-500/5 text-amber-500 border border-amber-500/10 rounded-lg text-[9px] font-bold">
                        קריאה: {tech.presence.currentTicketId}
                      </span>
                    )}

                    {status === "IN_REMOTE_SESSION" && tech.presence?.currentSupportSessionId && (
                      <span className="px-2 py-0.5 bg-blue-500/5 text-blue-500 border border-blue-500/10 rounded-lg text-[9px] font-bold">
                        סשן: {tech.presence.currentSupportSessionId}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
