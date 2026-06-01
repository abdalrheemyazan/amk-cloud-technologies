"use client";

import { Server, Activity, ShieldCheck, Cpu, HardDrive, RefreshCw, Layers } from "lucide-react";

export default function InfrastructurePage() {
  const nodes = [
    { name: "IL-CORE-DB-01", type: "Database Cluster", cpu: "14%", ram: "32GB / 64GB", disk: "1.2TB / 2.0TB", status: "ONLINE", latency: "2ms" },
    { name: "IL-APP-GATEWAY-02", type: "Nginx Gateway", cpu: "28%", ram: "8GB / 16GB", disk: "80GB / 250GB", status: "ONLINE", latency: "1ms" },
    { name: "US-EAST-REDUNDANT-05", type: "Backup Vault", cpu: "2%", ram: "4GB / 8GB", disk: "5.4TB / 10.0TB", status: "ONLINE", latency: "74ms" },
    { name: "IL-AI-INFERENCE-03", type: "GPU Worker Node", cpu: "82%", ram: "48GB / 128GB", disk: "450GB / 1.0TB", status: "BUSY", latency: "3ms" },
    { name: "EU-WEST-CACHE-01", type: "Redis Cache Cluster", cpu: "8%", ram: "12GB / 32GB", disk: "12GB / 50GB", status: "ONLINE", latency: "14ms" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">תשתיות ושירותי ענן</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">מצב בריאות, משאבים ורמת ביצועים של כלל שרתי המערכת</p>
        </div>
        <button className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-98">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>רענון מצב שרתים</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">שרתים פעילים</div>
            <div className="text-xl font-black text-slate-950 mt-0.5">5 / 5</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">עומס מעבד ממוצע</div>
            <div className="text-xl font-black text-slate-950 mt-0.5">26.8%</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">נפח אחסון בשימוש</div>
            <div className="text-xl font-black text-slate-950 mt-0.5">6.8TB / 13.3TB</div>
          </div>
        </div>
      </div>

      {/* Node Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-black text-slate-700">רשימת שרתים וצמתים</h4>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">סביבה: IL-CENTER-1</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-black">
                <th className="p-4">מזהה שרת</th>
                <th className="p-4">סוג שירות</th>
                <th className="p-4">עומס CPU</th>
                <th className="p-4">זיכרון RAM</th>
                <th className="p-4">נפח דיסק</th>
                <th className="p-4">זמן תגובה</th>
                <th className="p-4 text-center">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {nodes.map((n, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-extrabold text-slate-900">{n.name}</td>
                  <td className="p-4 text-slate-650 font-bold">{n.type}</td>
                  <td className="p-4 text-slate-600 font-semibold">{n.cpu}</td>
                  <td className="p-4 text-slate-500 font-medium">{n.ram}</td>
                  <td className="p-4 text-slate-500 font-medium">{n.disk}</td>
                  <td className="p-4 font-mono text-slate-600 font-semibold">{n.latency}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] items-center gap-1 ${
                      n.status === "ONLINE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${n.status === "ONLINE" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {n.status === "ONLINE" ? "פעיל" : "עסוק"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
