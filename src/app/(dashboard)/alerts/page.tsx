"use client";

import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  AlertOctagon, 
  Info,
  ShieldAlert,
  ServerCrash
} from "lucide-react";
import { useState } from "react";

const mockAlerts = [
  {
    id: "ALT-9042",
    severity: "critical",
    title: "קריסת שירות מסד נתונים - Node B",
    message: "Primary DB cluster is unresponsive. Failover initiated but latency is high.",
    time: "לפני 4 דקות",
    system: "Production DB",
    status: "active"
  },
  {
    id: "ALT-9041",
    severity: "warning",
    title: "עומס CPU גבוה (94%) מזהה תהליך חריג",
    message: "Service 'api-gateway' is consuming excessive CPU on node-worker-3.",
    time: "לפני 12 דקות",
    system: "API Gateway",
    status: "active"
  },
  {
    id: "ALT-9038",
    severity: "info",
    title: "עדכון גרסה הושלם בהצלחה",
    message: "Deployment v2.4.1 finished without errors in eu-west-1 region.",
    time: "לפני 1 שעה",
    system: "CI/CD",
    status: "resolved"
  },
  {
    id: "ALT-9035",
    severity: "warning",
    title: "שגיאות זיהוי (401 Unauthorized) בתדירות גבוהה",
    message: "Multiple failed auth attempts detected from IP range 185.x.x.x.",
    time: "לפני 3 שעות",
    system: "Auth Service",
    status: "acknowledged"
  }
];

export default function AlertsPage() {
  const [filter, setFilter] = useState("all");

  const filteredAlerts = mockAlerts.filter(alert => {
    if (filter === "all") return true;
    if (filter === "active") return alert.status === "active";
    if (filter === "critical") return alert.severity === "critical";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 text-right select-none" dir="rtl">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
            <AlertOctagon className="w-3 h-3" />
            מרכז התראות
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">ניהול התראות מערכת</h1>
          <p className="text-slate-500 text-xs font-semibold">
            צפייה וניהול של חריגות, תקלות ואירועי אבטחה בזמן אמת.
          </p>
        </div>
        
        {/* Actions / Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="חיפוש מזהה התראה..."
              className="bg-white border border-slate-200 rounded-xl py-2 pr-9 pl-4 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
            <Filter className="w-4 h-4" />
            סינון
          </button>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">התראות פעילות</p>
              <h3 className="text-3xl font-black text-slate-900">2</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">קריטי</p>
              <h3 className="text-3xl font-black text-rose-700">1</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <ServerCrash className="w-4 h-4 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">אזהרות</p>
              <h3 className="text-3xl font-black text-amber-700">2</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">נפתרו היום</p>
              <h3 className="text-3xl font-black text-slate-700">14</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pb-2">
        <button 
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          כל ההתראות
        </button>
        <button 
          onClick={() => setFilter("active")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'active' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          פעילות בלבד
        </button>
        <button 
          onClick={() => setFilter("critical")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'critical' ? 'bg-rose-600 text-white' : 'bg-white border border-slate-200 text-rose-600 hover:bg-rose-50'}`}
        >
          קריטי
        </button>
      </div>

      {/* Alerts List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-start gap-4">
                {/* Icon based on severity */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  alert.severity === "critical" ? "bg-rose-50 border-rose-100 text-rose-600" :
                  alert.severity === "warning" ? "bg-amber-50 border-amber-100 text-amber-600" :
                  "bg-blue-50 border-blue-100 text-blue-600"
                }`}>
                  {alert.severity === "critical" && <ServerCrash className="w-5 h-5" />}
                  {alert.severity === "warning" && <AlertTriangle className="w-5 h-5" />}
                  {alert.severity === "info" && <Info className="w-5 h-5" />}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {alert.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                    {alert.status === "active" && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-2" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-500 max-w-2xl leading-relaxed">
                    {alert.message}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-semibold text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </div>
                    <span className="text-slate-300">•</span>
                    <div>מערכת: <span className="text-slate-600 font-mono">{alert.system}</span></div>
                    <span className="text-slate-300">•</span>
                    <div className="uppercase tracking-widest text-slate-500 font-black">
                      STATUS: {alert.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pr-14 sm:pr-0">
                {alert.status === "active" && (
                  <button className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 rounded-lg text-[10px] font-bold transition-all shadow-sm">
                    אשר טיפול
                  </button>
                )}
                <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
              <p className="text-sm font-bold text-slate-600">אין התראות התואמות לסינון זה.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
