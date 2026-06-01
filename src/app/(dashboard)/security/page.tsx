"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Search, Filter, AlertTriangle, FileText, Calendar } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.auditLogs) {
            setLogs(json.auditLogs);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">יומן אירועים ופעולות מערכת</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">תיעוד מאובטח בזמן אמת של פעולות מנהלים וטכנאים (Audit Trail)</p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="סינון לפי פעולה, משתמש או מילות מפתח..."
            className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-3.5 py-2 border border-slate-200 text-slate-650 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>כל הרמות</span>
          </button>
          <button className="px-3.5 py-2 border border-slate-200 text-slate-655 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>היום</span>
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-black text-slate-700">פעולות אחרונות שתועדו</h4>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">תאימות מלאה לתקן ISO-27001</span>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-bold">טוען יומני מערכת...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-450 font-bold">לא נמצאו פעולות מתועדות במערכת</div>
        ) : (
          <div className="divide-y divide-slate-150">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {log.action.includes("AI") ? (
                      <FileText className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">{log.action}</div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-1">{log.details}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1">מאת: {log.user}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-bold shrink-0">{log.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
