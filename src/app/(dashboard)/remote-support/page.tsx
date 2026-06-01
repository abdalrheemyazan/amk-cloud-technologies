"use client";

import { 
  Play, 
  Terminal as TerminalIcon, 
  Shield, 
  Activity, 
  Zap, 
  Laptop, 
  Cpu, 
  Wifi, 
  Lock, 
  ExternalLink,
  ChevronLeft,
  Server,
  RefreshCw,
  AlertCircle,
  Key,
  ShieldCheck,
  History,
  Info
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function RemoteSupportPage() {
  const { data: session } = useSession();
  const [sessionStatus, setSessionStatus] = useState("idle"); // idle, connecting, connected
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "// AMK Cloud Support Live Diagnostics Terminal v1.0.2",
    "// Secure connection established over SSL/TLS."
  ]);

  const [auditLogs, setAuditLogs] = useState<{ time: string; event: string; status: string }[]>([
    { time: "00:14:10", event: "טעינת מודול דיאגנוסטיקה", status: "INFO" },
    { time: "00:14:12", event: "בדיקת הרשאות טכנאי", status: "OK" }
  ]);

  const handleConnect = () => {
    setSessionStatus("connecting");
    setTerminalLogs(prev => [
      ...prev, 
      "amk-agent --connect --channel=noc-secure", 
      "Initializing remote handshake protocol...", 
      "Verifying client certificates..."
    ]);
    
    setTimeout(() => {
      setSessionStatus("connected");
      setTerminalLogs(prev => [
        ...prev, 
        "[OK] Handshake completed successfully.",
        "[OK] Core agent active (PID: 92841)",
        "[OK] CPU: Intel(R) Xeon(R) Gold | RAM: 16.0GB",
        "[OK] Connected to NOC-CONSOLE-IL-3",
        "Initializing automatic diagnostic daemon...",
        "[WARN] Network default gateway has redundant paths.",
        "amk-agent --repair routing-table",
        "Applying routing table updates...",
        "[SUCCESS] Restored standard network metrics!"
      ]);
      setAuditLogs(prev => [
        ...prev,
        { time: "00:14:24", event: "אתחול מנהרת SSH מוצפנת", status: "OK" },
        { time: "00:14:25", event: "חיבור לסוכן NOC-CONSOLE-IL-3", status: "OK" },
        { time: "00:14:26", event: "אבחון מוקדם של נתיבי רשת", status: "WARN" }
      ]);
    }, 1500);
  };

  const handleDisconnect = () => {
    setSessionStatus("idle");
    setTerminalLogs([
      "// AMK Cloud Support Live Diagnostics Terminal v1.0.2",
      "// Secure connection established over SSL/TLS."
    ]);
    setAuditLogs([
      { time: "00:14:10", event: "טעינת מודול דיאגנוסטיקה", status: "INFO" },
      { time: "00:14:12", event: "בדיקת הרשאות טכנאי", status: "OK" }
    ]);
  };

  return (
    <div className="space-y-6 pb-20 text-right select-none" dir="rtl">
      {/* Background soft radial glow */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-indigo-50/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1 text-right">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider">
            <Laptop className="w-3 h-3" />
            מנהרת תקשורת מאובטחת
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">חיבור ודיאגנוסטיקה מרחוק</h1>
          <p className="text-slate-500 text-xs font-semibold">אבחון ותיקון תקלות מערכת מרוחקות באמצעות טרמינל סוכנים מאובטח בזמן אמת.</p>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area: Terminal Console & Auditing (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Live Session Feed & Terminal */}
          <div className="bg-white border border-slate-200/85 rounded-2xl shadow-sm flex flex-col min-h-[420px] overflow-hidden">
            <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-350" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-350" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-350" />
                <span className="text-xs font-black text-slate-800 mr-2.5 flex items-center gap-1.5">
                  <TerminalIcon className="w-3.5 h-3.5 text-slate-550" />
                  ממשק אבחון פעיל
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-450">
                <Lock className="w-3.5 h-3.5 text-emerald-550" />
                <span className="text-[9.5px] font-black tracking-wide uppercase">SHA-256 Tunnel</span>
              </div>
            </div>

            {/* Terminal Workspace Screen */}
            <div className="flex-1 bg-slate-950 p-5 font-mono text-[11.5px] leading-relaxed text-slate-300 min-h-[280px] overflow-y-auto max-h-[350px] relative text-left" dir="ltr">
              {terminalLogs.map((log, idx) => {
                let colorClass = "text-slate-400";
                if (log.startsWith("[SUCCESS]")) colorClass = "text-emerald-400 font-bold";
                else if (log.startsWith("[WARN]")) colorClass = "text-amber-400 font-bold";
                else if (log.startsWith("[OK]")) colorClass = "text-blue-400";
                else if (log.startsWith("amk-agent") || log.startsWith("ipconfig")) colorClass = "text-slate-200 font-bold";
                
                return (
                  <p key={idx} className={colorClass}>
                    {log.startsWith("amk-agent") || log.startsWith("ipconfig") ? `$ ${log}` : log}
                  </p>
                );
              })}

              {sessionStatus === "connecting" && (
                <p className="text-indigo-400 animate-pulse mt-1">$ establishing crypt tunnel...</p>
              )}

              {sessionStatus === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/90 pointer-events-none">
                  <TerminalIcon className="w-9 h-9 text-slate-700" />
                  <div className="space-y-0.5">
                    <p className="text-slate-300 font-bold text-xs">מסוף תקשורת כבוי</p>
                    <p className="text-slate-650 text-[10px] max-w-xs leading-relaxed">אנא לחץ על &quot;אתחל חיבור דיאגנוסטיקה&quot; על מנת לפתוח את מנהרת ה-SSH ולקבל פלט מהשרת המרוחק.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Actions Tool Bar */}
            <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex flex-wrap gap-3 items-center justify-between">
              <span className="text-[10px] text-slate-450 font-bold">פעולות מהירות לסוכן:</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (sessionStatus !== "connected") return;
                    setTerminalLogs(prev => [...prev, "amk-agent --test-speed", "Measuring connection latency to nodes...", "[OK] Upload: 84.2 Mbps | Download: 110.1 Mbps", "[OK] Speed test passed successfully."]);
                    setAuditLogs(prev => [...prev, { time: new Date().toTimeString().split(' ')[0], event: "הרצת בדיקת מהירות ערוץ", status: "OK" }]);
                  }}
                  disabled={sessionStatus !== "connected"}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-50 text-[10px] font-bold text-slate-700 rounded-lg shadow-sm transition-all"
                >
                  בדיקת מהירות שרת
                </button>
                <button 
                  onClick={() => {
                    if (sessionStatus !== "connected") return;
                    setTerminalLogs(prev => [...prev, "ipconfig /flushdns", "Flushing DNS Resolver Cache...", "[SUCCESS] Successfully flushed the DNS Resolver Cache."]);
                    setAuditLogs(prev => [...prev, { time: new Date().toTimeString().split(' ')[0], event: "ניקוי מטמון DNS שרת", status: "OK" }]);
                  }}
                  disabled={sessionStatus !== "connected"}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-50 text-[10px] font-bold text-slate-700 rounded-lg shadow-sm transition-all"
                >
                  ניקוי מטמון DNS
                </button>
              </div>
            </div>
          </div>

          {/* Secure Audit activity & Connection Logs - Split sub-grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Sec Connection Log */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5 text-right">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Key className="w-4 h-4 text-blue-600" />
                רשומות מנהרה מאובטחת
              </h4>
              <div className="space-y-2 text-[10.5px] leading-relaxed">
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <span className="text-slate-400">חתימת מפתח SHA:</span>
                  <span className="font-mono text-slate-700">sha256:d8:a4:23...</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <span className="text-slate-400">פרוטוקול ערוץ:</span>
                  <span className="font-bold text-slate-700">SSH-2.0-OpenSSH_9.0</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <span className="text-slate-400">אימות זהות סוכן:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    תעודה מאושרת
                  </span>
                </div>
              </div>
            </div>

            {/* Audit activity logs */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5 text-right">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <History className="w-4 h-4 text-blue-600" />
                יומן פעילות אבטחה (Audit)
              </h4>
              <div className="space-y-2 overflow-y-auto max-h-[110px] custom-scrollbar">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b border-slate-100/50">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 font-mono">{log.time}</span>
                      <span className="text-slate-700 font-semibold">{log.event}</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded font-black text-[8px] ${
                      log.status === "OK" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      log.status === "WARN" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                      "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Area: Secure Connection Control Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Connection Control Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5 text-right">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900">בקרת חיבור מרחוק</h3>
              <p className="text-slate-500 text-xs font-semibold">ייזום ערוץ בטוח לביצוע בדיקות מרוחקות בשרתי העבודה.</p>
            </div>

            <div className="p-5 bg-slate-50/60 border border-slate-200/80 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
              {sessionStatus === "idle" && (
                <>
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <Laptop className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800 block">ערוץ לא הותחל</span>
                    <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed px-2">אנא הפעל את החיבור המאובטח לצורך הרצת פקודות ותיקון.</p>
                  </div>
                  <button 
                    onClick={handleConnect}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    אתחל חיבור דיאגנוסטיקה
                  </button>
                </>
              )}

              {sessionStatus === "connecting" && (
                <>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center animate-spin">
                    <RefreshCw className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-indigo-650 block">יוצר מנהרת SSH...</span>
                    <p className="text-[9.5px] text-slate-450 font-semibold">מבצע אימות מפתחות מול שרת הקצה</p>
                  </div>
                  <button 
                    onClick={handleDisconnect}
                    className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
                  >
                    ביטול חיבור
                  </button>
                </>
              )}

              {sessionStatus === "connected" && (
                <>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-emerald-600 block">מחובר בהצלחה</span>
                    <p className="text-[9.5px] text-slate-500 font-semibold">ערוץ התקשורת פעיל ומאובטח כעת</p>
                  </div>
                  <button 
                    onClick={handleDisconnect}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl font-bold text-xs transition-all active:scale-98"
                  >
                    סגור מנהרת תקשורת
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Secure Tunnel Telemetry Status Metadata */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-right">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest block pb-2 border-b border-slate-100">מפרט ערוץ דיאגנוסטיקה</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold">מצב מנהרה:</span>
                <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg ${
                  sessionStatus === "connected" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  sessionStatus === "connecting" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                  "bg-slate-100 text-slate-500 border border-slate-200"
                }`}>
                  {sessionStatus === "connected" ? "AES-256-GCM / Secured" : sessionStatus === "connecting" ? "CONNECTING" : "OFFLINE"}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold">אזור פעיל:</span>
                <span className="text-slate-800 font-bold">il-central-1 (Tel Aviv)</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold">זמן תגובה (Latency):</span>
                <span className="text-slate-800 font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  {sessionStatus === "connected" ? "14 ms" : "--"}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold">פרוטוקול גישה:</span>
                <span className="text-slate-700 font-semibold">SSH over HTTPS</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold">מצב SSH:</span>
                <span className={`text-[10px] font-bold ${sessionStatus === "connected" ? "text-emerald-600" : "text-slate-450"}`}>
                  {sessionStatus === "connected" ? "CONNECTED / AUTH" : "DISCONNECTED"}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                <span className="text-slate-450 font-semibold">טכנאי מחובר:</span>
                <span className="text-blue-700 font-black text-[11px] bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50">
                  {session?.user?.name || "מפעיל מערכת"}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
