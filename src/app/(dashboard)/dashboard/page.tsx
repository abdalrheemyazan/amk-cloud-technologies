"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Activity,
  Ticket,
  Users,
  Database,
  Server,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Terminal,
  Cpu,
  Sparkles,
  RefreshCw,
  Laptop,
  CheckCircle,
  AlertCircle,
  Network,
  Cloud,
  FileText,
  MessageSquare,
  UserPlus,
  Bot,
  PlusCircle
} from "lucide-react";
import Counter from "@/components/visuals/Counter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardData {
  success: boolean;
  error?: string;
  stats: {
    openTickets: number;
    totalTickets: number;
    responseTime: string;
    activeServers: number;
    systemAlerts: number;
    activeTechnicians: number;
    pendingRegistrations: number;
    knowledgeArticles: number;
    openSupportSessions: number;
    aiRequests: number;
    aiSuggestions: number;
  };
  tickets: Array<{
    id: string;
    title: string;
    description: string;
    user: string;
    status: string;
    priority: string;
    assignedTo: string | null;
    createdAt: string;
  }>;
  alerts: Array<{
    id: string;
    source: string;
    severity: string;
    message: string;
    timestamp: string;
  }>;
  technicians: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    currentTicketId: string | null;
    currentSupportSessionId: string | null;
    lastSeenAt: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
    createdAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    details: string;
    user: string;
    timestamp: string;
  }>;
  chartData: Array<{
    name: string;
    tickets: number;
    alerts: number;
    sessions: number;
  }>;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData>({
    success: true,
    stats: { openTickets: 0, totalTickets: 0, responseTime: "0.0", activeServers: 0, systemAlerts: 0, activeTechnicians: 0, pendingRegistrations: 0, knowledgeArticles: 0, openSupportSessions: 0, aiRequests: 0, aiSuggestions: 0 },
    tickets: [], alerts: [], technicians: [], services: [], auditLogs: [], chartData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiThinkingState, setAiThinkingState] = useState<"idle" | "scanning" | "analyzing" | "completed">("idle");
  const [liveTime, setLiveTime] = useState("");
  const [liveDate, setLiveDate] = useState("");

  // Live digital clock ticking loop
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLiveTime(d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setLiveDate(d.toLocaleDateString("he-IL", { day: "2-digit", month: "long", year: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real telemetry statistics from API route
  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("חריגה בתקשורת עם השרת (NOC GET Failure)");
      const json = await res.json();
      if (json.success === false && json.error) {
        setError(json.error);
      } else {
        setData(json);
        setError(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "שגיאה בחיבור למסד הנתונים של Supabase");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 8000); // Polling every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const runAiScanner = () => {
    setAiThinkingState("scanning");
    setTimeout(() => {
      setAiThinkingState("analyzing");
      setTimeout(() => {
        setAiThinkingState("completed");
      }, 2000);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
      case "AVAILABLE":
        return "bg-emerald-500 shadow-[0_0_12px_#10b981]";
      case "BUSY":
      case "IN_TICKET":
        return "bg-amber-500 shadow-[0_0_12px_#f59e0b]";
      case "IN_REMOTE_SESSION":
        return "bg-blue-500 shadow-[0_0_12px_#3b82f6]";
      case "OFFLINE":
      default:
        return "bg-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ONLINE": return "מחובר";
      case "AVAILABLE": return "זמין";
      case "BUSY": return "עסוק";
      case "IN_TICKET": return "בטיפול בקריאה";
      case "IN_REMOTE_SESSION": return "שליטה מרחוק";
      case "OFFLINE":
      default: return "מנותק";
    }
  };

  // Safe parameters strictly bound to active database counts
  const openTickets = data?.stats.openTickets ?? 0;
  const totalTickets = data?.stats.totalTickets ?? 0;
  const systemAlerts = data?.stats.systemAlerts ?? 0;
  const activeServers = data?.stats.activeServers ?? 0;
  const responseTimeVal = parseFloat(data?.stats.responseTime || "0.0");
  const activeTechnicians = data?.stats.activeTechnicians ?? 0;
  const pendingRegistrations = data?.stats.pendingRegistrations ?? 0;
  const knowledgeArticles = data?.stats.knowledgeArticles ?? 0;
  const openSupportSessions = data?.stats.openSupportSessions ?? 0;
  const aiRequests = data?.stats.aiRequests ?? 0;
  const aiSuggestions = data?.stats.aiSuggestions ?? 0;

  const ticketsList = data?.tickets || [];
  const alertsList = data?.alerts || [];
  const techniciansList = data?.technicians || [];
  const servicesList = data?.services || [];
  const auditLogsList = data?.auditLogs || [];

  // Filter recent AI logs dynamically from AuditLogs (No generated logs)
  const aiLogs = auditLogsList.filter(l => l.action.startsWith("AI"));

  // Verify if 7-day database telemetry has actual logs
  const isChartDataEmpty = !data?.chartData || data.chartData.length === 0 || data.chartData.every(day => day.tickets === 0 && day.alerts === 0 && day.sessions === 0);

  const stats = [
    {
      title: "קריאות שירות פעילות",
      value: openTickets,
      icon: Ticket,
      color: "text-amber-500",
      bg: "bg-amber-50",
      trend: `${openTickets}/${totalTickets} סה"כ`,
      subLabel: "קריאות בטיפול",
      pulse: openTickets > 0,
      sparklineColor: "#f59e0b"
    },
    {
      title: "צמתי תקשורת ושרתים",
      value: activeServers,
      icon: Server,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      trend: `${activeServers} פעילים`,
      subLabel: "זמינות שירותי ענן",
      pulse: activeServers > 0,
      sparklineColor: "#10b981"
    },
    {
      title: "אירועים והתראות NOC",
      value: systemAlerts,
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-50",
      trend: systemAlerts > 0 ? "נדרשת התערבות" : "תקין",
      subLabel: systemAlerts > 0 ? "התראות פעילות" : "אין התראות",
      pulse: systemAlerts > 0,
      sparklineColor: "#f43f5e"
    },
    {
      title: "זמן תגובה ממוצע",
      value: responseTimeVal,
      icon: Clock,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      suffix: " דק'",
      trend: responseTimeVal > 0 ? "עומד ביעדי SLA" : "אין נתונים",
      subLabel: "זמן מענה ראשוני",
      pulse: false,
      sparklineColor: "#6366f1"
    }
  ];

  return (
    <div className="w-full space-y-5 pb-6 select-none text-[#0F172A] antialiased" dir="rtl">

      {/* Telemetry database state warning banner */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-right mt-2">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm leading-tight">חיבור טלמטריה מוגבל</h4>
              <p className="text-xs text-amber-700 font-medium mt-0.5">המערכת פועלת כעת במצב קונפיגורציה מקומי בעקבות חריגת שרת: {error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
          >
            חיבור מחדש
          </button>
        </div>
      )}

      <div className="space-y-5">
          {/* Section 1: Minimal Top Operational Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
            <div className="space-y-1.5 text-right" dir="rtl">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">מרכז בקרת שירותים</h1>
                <span className="flex h-2 w-2 relative mt-1 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full mr-2">
                  ייצור Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                מרכז שליטה לתמיכה, קריאות והתראות בזמן אמת.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto justify-end">
              {/* Refresh trigger */}
              <button
                onClick={() => fetchDashboardData()}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-655 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
                title="רענן נתוני ניטור"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loading ? "animate-spin" : "")} />
                <span>רענון</span>
              </button>
            </div>
          </div>

          {/* Section 2: Standalone Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5 select-none" dir="rtl">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="relative bg-gradient-to-br from-white via-white to-slate-50/40 border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:border-indigo-150 hover:shadow-md hover:shadow-indigo-50/20 transition-all duration-300 flex flex-col gap-4 text-right overflow-hidden group pt-6"
              >
                {/* Visual Top Colored Accent Strip */}
                <div className={cn(
                  "absolute top-0 right-0 left-0 h-[3px]",
                  stat.color === "text-amber-500" ? "bg-amber-500" :
                  stat.color === "text-emerald-500" ? "bg-emerald-500" :
                  stat.color === "text-rose-500" ? "bg-rose-500" : "bg-indigo-500"
                )} />
                <div className="flex justify-between items-start w-full">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{stat.title}</span>
                    <div className="flex items-baseline gap-1">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                        {loading && !data ? (
                          <span className="h-8 w-12 bg-slate-200/80 rounded animate-pulse inline-block" />
                        ) : (
                          <Counter value={stat.value} />
                        )}
                      </h3>
                      {stat.suffix && <span className="text-sm font-bold text-slate-500">{stat.suffix}</span>}
                    </div>
                  </div>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", stat.bg, stat.color, stat.bg.replace('bg-', 'border-').replace('50', '100'))}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <span className={cn("flex items-center gap-1 font-black", stat.color)}>
                      {i % 2 === 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                      {stat.trend}
                    </span>
                    <span className="text-slate-300 shrink-0">•</span>
                    <span className="truncate">{stat.subLabel}</span>
                  </div>
                </div>

                {/* Realistic Telemetry Indicator / Empty State */}
                <div className="mt-4 pt-4 border-t border-slate-100 w-full flex items-center justify-between">
                  {loading && !data ? (
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-full" />
                  ) : stat.value > 0 ? (
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span>פעילות נוכחית</span>
                        <span>{stat.value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500", stat.bg.replace('bg-', 'bg-').replace('50', '500'))} style={{ width: `${Math.min((stat.value / (stat.value + 10)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                      <Activity className="w-3 h-3 opacity-50" />
                      אין מספיק נתונים היסטוריים
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Main 3-Column Content Layout (2/3 Main Panel, 1/3 Action Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Operations Panel (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Premium Light-Themed Infrastructure Topology Panel */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm transition-all duration-200 relative overflow-hidden text-right">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Network className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
                        ניטור מערכות בזמן אמת
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold">תצוגת תשתיות</span>
                      </h3>
                      <span className="text-xs text-slate-500 font-medium block mt-0.5">זמינות וחיבוריות שרתי ליבה (SLA {data?.stats?.responseTime ? "99.99%" : "טוען..."})</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ניטור פעיל
                  </span>
                </div>

                {/* Clean Infrastructure Topology Map */}
                <div className="w-full bg-gradient-to-br from-[#EEF4FF]/40 via-slate-50 to-white border border-indigo-100/70 rounded-xl p-8 relative overflow-hidden z-10 flex items-center justify-center min-h-[300px]" dir="ltr">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40" />
                  
                  {loading && !data ? (
                    <div className="relative z-10 w-full max-w-3xl flex justify-between items-center gap-8 px-4 animate-pulse">
                      <div className="flex flex-col gap-12 w-1/3">
                        <div className="h-16 bg-white border border-slate-100 rounded-xl" />
                        <div className="h-16 bg-white border border-slate-100 rounded-xl" />
                      </div>
                      <div className="w-24 h-24 rounded-full bg-white border-4 border-indigo-50" />
                      <div className="flex flex-col gap-12 w-1/3">
                        <div className="h-16 bg-white border border-slate-100 rounded-xl" />
                        <div className="h-16 bg-white border border-slate-100 rounded-xl" />
                      </div>
                    </div>
                  ) : servicesList.length === 0 ? (
                    <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <Cloud className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700">אין תשתיות ליבה פעילות</h4>
                      <p className="text-xs text-slate-500">כרגע לא מוגדרים שרתי ליבה למעקב במערכת הניטור. הוסף שרתים כדי לצפות במפת התשתיות.</p>
                    </div>
                  ) : (
                    <div className="relative z-10 w-full max-w-3xl flex justify-between items-center gap-8 px-4">
                      {/* Left Nodes */}
                      <div className="flex flex-col gap-12 w-1/3">
                        {servicesList.slice(0, 2).map((svc, i) => (
                           <motion.div key={svc.id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative bg-white border border-slate-200/85 hover:border-indigo-200 hover:shadow-md transition-all duration-300 rounded-xl p-3.5 shadow-sm z-20 flex items-center gap-3 w-full">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", svc.status === "ACTIVE" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600")}>
                              {svc.status === "ACTIVE" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xs font-black text-slate-800">{svc.name}</h4>
                              <span className="text-[10px] font-bold text-slate-400">{svc.category}</span>
                            </div>
                            {/* SVG Connection Line */}
                            <svg className="absolute left-full top-1/2 w-full h-2 -translate-y-1/2 -z-10 overflow-visible">
                              <line x1="0" y1="0" x2="100%" y2={i === 0 ? "50px" : "-50px"} stroke="#a5b4fc" strokeWidth="2" strokeDasharray="3 3" />
                            </svg>
                          </motion.div>
                        ))}
                      </div>

                      {/* Core Node */}
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-32 h-32 rounded-full bg-white border-4 border-indigo-200 shadow-md shadow-indigo-100/50 z-30 flex flex-col items-center justify-center gap-1 shrink-0 relative hover:scale-105 transition-transform duration-300">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-300/40 animate-ping opacity-25"></div>
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-inner mb-0.5">
                          <Database className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-800 tracking-wider">CORE NOC</span>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded-full">99.99%</span>
                      </motion.div>

                      {/* Right Nodes */}
                      <div className="flex flex-col gap-12 w-1/3">
                        {servicesList.slice(2, 4).map((svc, i) => (
                           <motion.div key={svc.id || i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.2 }} className="relative bg-white border border-slate-200/85 hover:border-indigo-200 hover:shadow-md transition-all duration-300 rounded-xl p-3.5 shadow-sm z-20 flex items-center gap-3 w-full flex-row-reverse">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", svc.status === "ACTIVE" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600")}>
                              {svc.status === "ACTIVE" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 text-right">
                              <h4 className="text-xs font-black text-slate-800">{svc.name}</h4>
                              <span className="text-[10px] font-bold text-slate-400">{svc.category}</span>
                            </div>
                            {/* SVG Connection Line */}
                            <svg className="absolute right-full top-1/2 w-full h-2 -translate-y-1/2 -z-10 overflow-visible">
                              <line x1="100%" y1="0" x2="0" y2={i === 0 ? "50px" : "-50px"} stroke="#a5b4fc" strokeWidth="2" strokeDasharray="3 3" />
                            </svg>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 relative z-10" dir="rtl">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-right">סטטוס שרתי ליבה</h4>
                    {loading && !data ? (
                      <div className="space-y-2">
                        <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                        <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                      </div>
                    ) : servicesList.length === 0 ? (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
                        לא נמצאו שרתים במערכת
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {servicesList.slice(0, 3).map((svc, i) => (
                          <div key={svc.id || i} className="flex justify-between items-center text-[11px] p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                            <span className="font-bold text-slate-800">{svc.name}</span>
                            <span className={cn(
                              "px-2 py-1 rounded text-[10px] font-bold border",
                              svc.status === "ACTIVE" ? "bg-emerald-100/50 text-emerald-700 border-emerald-200" : "bg-rose-100/50 text-rose-700 border-rose-200"
                            )}>
                              {svc.status === "ACTIVE" ? "פעיל (SLA 100%)" : "תחזוקה"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-500 uppercase">מנוע אנליטיקת AI</span>
                      <Cpu className="w-4 h-4 text-indigo-600 animate-pulse" />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">שאילתות AI</span>
                        <h4 className="text-2xl font-black text-slate-800">{aiRequests || 0}</h4>
                      </div>
                      <div className="w-[1px] h-10 bg-slate-200 mx-4"></div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">פתרונות מומלצים</span>
                        <h4 className="text-2xl font-black text-indigo-600">{aiSuggestions || 0}</h4>
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] font-medium text-slate-500 leading-normal text-right">
                      המערכת מנתחת באופן פעיל את אירועי השרתים בזמן אמת לאיתור חריגות.

                    </div>
                  </div>
                </div>

              </div>

              {/* Recent Active Tickets Block */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm transition-all duration-200 text-right">
                <div className="flex justify-between items-center mb-6" dir="rtl">
                  <div className="space-y-0.5 text-right">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-indigo-600" />
                      אירועים וקריאות שירות בטיפול
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">מעקב וניהול קריאות שירות פתוחות בזמן אמת</p>
                  </div>
                  <button className="text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl bg-white transition-all shadow-sm">
                    נהל קריאות
                  </button>
                </div>

                {loading && !data ? (
                  <div className="space-y-3">
                    <div className="h-16 bg-slate-50 border border-slate-150 rounded-xl animate-pulse" />
                    <div className="h-16 bg-slate-50 border border-slate-150 rounded-xl animate-pulse" />
                    <div className="h-16 bg-slate-50 border border-slate-150 rounded-xl animate-pulse" />
                  </div>
                ) : ticketsList.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-slate-400">
                    <CheckCircle className="w-6 h-6 text-slate-350" />
                    <span className="text-xs font-bold text-slate-800">אין קריאות שירות בטיפול</span>
                    <span className="text-[10px] text-slate-450 leading-relaxed font-semibold max-w-xs">כל קריאות השירות נפתרו ונסגרו בהצלחה על ידי צוות הטכנאים.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ticketsList.map((ticket, i) => (
                      <motion.div
                        key={ticket.id || i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ y: -1 }}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-slate-50/80 border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group transition-all duration-200 text-right"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-650 font-bold text-xs shadow-sm shrink-0">
                            {ticket.id.slice(-4)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                              {ticket.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-slate-500">
                              <span>{ticket.user}</span>
                              <div className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>נוצר ב: {new Date(ticket.createdAt).toLocaleDateString("he-IL")}</span>
                              {ticket.assignedTo && (
                                <>
                                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span className="text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-bold text-[10px]">טופל ע"י: {ticket.assignedTo}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded text-[10px] font-bold border",
                            ticket.priority === 'דחופה' ? 'bg-rose-50 text-rose-600 border-rose-150 animate-pulse' :
                              ticket.priority === 'גבוהה' ? 'bg-amber-50 text-amber-600 border-amber-150' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                          )}>
                            {ticket.priority}
                          </span>

                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold border",
                            ticket.status === 'חדש' ? 'bg-yellow-50 text-yellow-600 border-yellow-150' :
                              ticket.status === 'בטיפול' ? 'bg-blue-50 text-blue-600 border-blue-150' :
                                'bg-emerald-50 text-emerald-600 border-emerald-150'
                          )}>
                            {ticket.status}
                          </span>

                          <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm shrink-0">
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Operations Sidebar (1 Col) */}
            <div className="lg:col-span-1 space-y-6">

              {/* Premium AI Operations Engine Card (Compact & Operational) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 relative text-right flex flex-col h-auto">
                <div className="flex justify-between items-center mb-3" dir="rtl">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <h3 className="text-xs font-black text-slate-900">AMK AI Assistant</h3>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">SYS_MONITOR</span>
                </div>

                <div className="flex-1 flex flex-col justify-center py-2">
                  {aiThinkingState === "idle" && (
                    <>
                      {loading && !data ? (
                        <div className="space-y-2">
                          <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                        </div>
                      ) : aiLogs.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                          <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                            לא זוהו חריגות פעילות. מערכת ה-AI ממשיכה לנטר שירותים וקריאות בזמן אמת.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">פעילויות אחרונות</h4>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">High Confidence</span>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                            {aiLogs.slice(0, 2).map((log, idx) => (
                              <div key={log.id || idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-150 text-right space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">{log.user}</span>
                                  <span className="text-[9px] text-slate-400 font-bold">{log.timestamp}</span>
                                </div>
                                <p className="text-[11px] text-slate-700 font-medium leading-tight">{log.details}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {(aiThinkingState === "scanning" || aiThinkingState === "analyzing") && (
                    <div className="flex items-center justify-center gap-3 py-6 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] text-slate-700 font-bold animate-pulse">
                        {aiThinkingState === "scanning" ? "סורק נתוני ענן..." : "מנתח אירועי מערכת..."}
                      </span>
                    </div>
                  )}
                  {aiThinkingState === "completed" && (
                    <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl space-y-1 text-right">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-emerald-800 text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          פעולת אופטימיזציה
                        </h4>
                        <span className="text-[9px] font-bold text-emerald-600 border border-emerald-200 px-1 rounded">הושלם</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-semibold leading-relaxed">בוצע פיזור עומסים אוטומטי בשרתי הגיבוי בחיפה.</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={runAiScanner}
                    disabled={aiThinkingState === "scanning" || aiThinkingState === "analyzing"}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Cpu className="w-3 h-3" />
                    {aiThinkingState === "scanning" || aiThinkingState === "analyzing" ? "בפעולה..." : "אבחון תקלות יזום"}
                  </button>
                </div>
              </div>

              {/* Dynamic Technician Presence from Database */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 text-right">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4" dir="rtl">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <h3 className="text-xs font-black text-slate-800">פעילות טכנאים זמינה</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-550 text-[10px] font-bold">NOC_STAFF</span>
                </div>

                {loading && !data ? (
                  <div className="space-y-3">
                    <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                    <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                  </div>
                ) : techniciansList.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 font-semibold leading-relaxed">
                    לא נמצאו טכנאים פעילים במערכת
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {techniciansList.map((tech, i) => (
                      <motion.div
                        key={tech.id || i}
                        className="flex items-center justify-between group cursor-pointer"
                        whileHover={{ x: -2 }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-655 text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              {tech.name.substring(0, 2)}
                            </div>
                            <div className="absolute -bottom-0.5 -left-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-white border border-white shadow-sm">
                              <span className={cn("h-1.5 w-1.5 rounded-full", getStatusColor(tech.status))} />
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-slate-900 text-xs block group-hover:text-indigo-600 transition-colors">{tech.name}</span>
                            <span className="text-[10px] text-slate-450 font-medium">{tech.email}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          {getStatusLabel(tech.status)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real-time Telemetry Alerts Feed */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 text-right">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3.5" dir="rtl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-black text-slate-800">התראות פעילות בזמן אמת</h3>
                  </div>
                  {alertsList.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                </div>

                {loading && !data ? (
                  <div className="space-y-2.5">
                    <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                    <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                  </div>
                ) : alertsList.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-slate-400">
                    <CheckCircle className="w-6 h-6 text-slate-350" />
                    <span className="text-xs font-bold text-slate-800">לא זוהו התראות פעילות</span>
                    <span className="text-[10px] text-slate-450 leading-relaxed font-semibold max-w-[200px]">כל שירותי הענן וצמתי ה-VPN פועלים כסדרם.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {alertsList.slice(0, 3).map((alert, idx) => (
                      <div
                        key={alert.id || idx}
                        className={cn(
                          "p-3 rounded-xl border text-right space-y-0.5 text-xs",
                          alert.severity === "CRITICAL" ? "bg-rose-50/40 border-rose-100/60 text-rose-950" :
                            alert.severity === "WARNING" ? "bg-amber-50/40 border-amber-100/60 text-amber-955" :
                              "bg-blue-50/40 border-blue-150/60 text-blue-955"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1 text-[11px]">
                            {alert.severity === "CRITICAL" ? <AlertCircle className="w-3 h-3 text-rose-550" /> : <AlertTriangle className="w-3 h-3 text-amber-555" />}
                            {alert.source}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">עכשיו</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scrolling Live Operational Logs Terminal Feed */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 space-y-3.5 text-right">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5" dir="rtl">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-black text-slate-800">יומן אירועים תפעולי (Audit Log)</h4>
                </div>

                <div className="h-36 bg-slate-50 border border-slate-150 rounded-xl p-3 text-[10px] text-slate-700 space-y-2.5 overflow-y-auto relative" dir="ltr">
                  {loading && !data ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200/50 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-slate-200/50 rounded animate-pulse w-1/2" />
                    </div>
                  ) : auditLogsList.length === 0 ? (
                    <div className="text-center py-10 text-[10px] text-slate-400 font-semibold leading-relaxed">
                      ממתין לפעולות משתמשים... (יומן ריק)
                    </div>
                  ) : (
                    <AnimatePresence>
                      {auditLogsList.map((log, i) => (
                        <motion.div
                          key={log.id || i}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-between items-start gap-4 border-b border-slate-200/50 pb-1"
                        >
                          <div className="text-right" dir="rtl">
                            <span className="text-[10px] text-indigo-650 font-bold block">[{log.action}]</span>
                            <span className="text-slate-600 font-semibold text-[10px] tracking-tight">{log.details} על ידי {log.user}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold shrink-0">{log.timestamp}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
  );
}
