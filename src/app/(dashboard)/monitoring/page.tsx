"use client";

import { 
  Activity, 
  Cpu, 
  Server, 
  HardDrive, 
  Network, 
  Wifi, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function MonitoringPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulated live data effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 800);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 text-right select-none" dir="rtl">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
            <Activity className="w-3 h-3" />
            NOC Telemetry
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">ניטור מערכות בזמן אמת</h1>
          <p className="text-slate-500 text-xs font-semibold">
            מצב תקינות השרתים, משאבי מערכת ותעבורת רשת בחוות השרתים.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            עודכן לאחרונה: לפני 2 שניות
          </div>
          <button 
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => setIsRefreshing(false), 600);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            רענון נתונים
          </button>
        </div>
      </header>

      {/* Main Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">42%</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">ממוצע CPU</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden group hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowDownRight className="w-3 h-3" /> -5%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">68%</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">צריכת RAM</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* Network */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Network className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peak</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">1.2<span className="text-sm text-slate-400 ml-1">Gbps</span></h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">תעבורת רשת</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Latency */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden group hover:border-amber-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-amber-600" />
            </div>
            <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Elevated
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">42<span className="text-sm text-slate-400 ml-1">ms</span></h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Latency ממוצע</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Health Grid (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" /> סטטוס שרתי ליבה
              </h3>
              <span className="text-[10px] font-bold text-slate-400">9/10 Online</span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {/* Healthy Node */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono">il-node-prod-01</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Primary API Gateway • eu-west-1</p>
                  </div>
                </div>
                <div className="flex gap-6 text-[10px] font-mono text-slate-500">
                  <span>CPU: 34%</span>
                  <span>RAM: 61%</span>
                  <span className="text-emerald-500 font-bold">OK</span>
                </div>
              </div>

              {/* Healthy Node */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono">il-node-prod-02</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Primary Database Cluster • eu-west-1</p>
                  </div>
                </div>
                <div className="flex gap-6 text-[10px] font-mono text-slate-500">
                  <span>CPU: 62%</span>
                  <span>RAM: 88%</span>
                  <span className="text-emerald-500 font-bold">OK</span>
                </div>
              </div>

              {/* Warning Node */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors bg-amber-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono">il-node-worker-03</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Background Job Processor • eu-west-1</p>
                  </div>
                </div>
                <div className="flex gap-6 text-[10px] font-mono text-slate-500">
                  <span className="text-rose-500 font-bold">CPU: 94%</span>
                  <span>RAM: 45%</span>
                  <span className="text-amber-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> HIGH LOAD</span>
                </div>
              </div>

              {/* Healthy Node */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono">il-node-cache-01</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Redis Cache Cluster • eu-west-1</p>
                  </div>
                </div>
                <div className="flex gap-6 text-[10px] font-mono text-slate-500">
                  <span>CPU: 12%</span>
                  <span>RAM: 76%</span>
                  <span className="text-emerald-500 font-bold">OK</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Charts Placeholder (1 Col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
            <h3 className="text-xs font-bold text-white mb-4">תעבורת רשת (Live)</h3>
            
            {/* Fake Chart bars */}
            <div className="h-32 flex items-end gap-1.5 opacity-80">
              {[40, 65, 45, 80, 55, 90, 70, 45, 60, 35, 50, 85, 65, 75, 40].map((h, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 rounded-t-sm transition-all duration-500",
                    h > 80 ? "bg-rose-500" : h > 60 ? "bg-indigo-400" : "bg-blue-500"
                  )}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            
            <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-2">
              <span>-15m</span>
              <span>-10m</span>
              <span>-5m</span>
              <span className="text-blue-400 font-bold">Now</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 mb-4 pb-2 border-b border-slate-100">יומן אירועי תשתית אחרונים</h3>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-800 leading-tight">גיבוי אוטומטי הושלם (DB-Cluster)</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">לפני 12 דקות</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-800 leading-tight">Scale-up אוטומטי הופעל ב-Worker-3 due to CPU load</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">לפני 28 דקות</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-800 leading-tight">Deployment חדש ל-Frontend (v2.4.1)</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">לפני שעה</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
