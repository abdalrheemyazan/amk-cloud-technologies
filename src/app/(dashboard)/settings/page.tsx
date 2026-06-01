"use client";

import { useState } from "react";
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Terminal, 
  Key,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  MonitorSmartphone,
  LogOut,
  RefreshCw,
  MoreVertical,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "פרופיל משתמש", icon: User },
  { id: "security", label: "אבטחה וגישה", icon: ShieldCheck },
  { id: "sessions", label: "ניהול סשנים", icon: MonitorSmartphone },
  { id: "api", label: "חיבורי API", icon: Terminal },
  { id: "notifications", label: "התראות מערכת", icon: Bell },
  { id: "preferences", label: "העדפות ממשק", icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);

  // DEBUG LOG AS REQUESTED
  console.log("SettingsPage RENDERED. Current Path:", typeof window !== 'undefined' ? window.location.pathname : 'server-side');

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 select-none" dir="rtl">
      
      {/* Settings Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest">
            <SettingsIcon className="w-3 h-3" />
            Workspace Settings
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">הגדרות מערכת</h1>
          <p className="text-slate-500 text-xs font-semibold">
            ניהול פרופיל, אבטחה, מפתחות גישה והעדפות סביבת העבודה שלך.
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-left">
          <div className="flex flex-col text-right items-end">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Environment</span>
            <span className="text-xs font-black text-blue-600 flex items-center gap-1.5">
              IL-CENTER-1 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1 sticky top-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 text-right group",
                activeTab === tab.id
                  ? "bg-white text-blue-700 shadow-[0_2px_10px_rgba(37,99,235,0.06)] border border-blue-100/50"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              )}
            >
              <tab.icon className={cn(
                "w-4 h-4 transition-colors",
                activeTab === tab.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-8 pb-8 border-b border-slate-100">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-white text-3xl font-black shadow-md shadow-blue-500/20 ring-4 ring-blue-50 transition-all group-hover:ring-blue-100">
                      AM
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-bold">החלף תמונה</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <h2 className="text-lg font-black text-slate-900">אדמין מערכת</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
                        Administrator
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> חשבון מאומת
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">שם מלא</label>
                    <input type="text" defaultValue="אדמין מערכת" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">אימייל עבודה</label>
                    <input type="email" defaultValue="admin@amk-cloud.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">טלפון חירום</label>
                    <input type="tel" defaultValue="+972-50-1234567" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">תפקיד</label>
                    <input type="text" value="System Operator" disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95">
                    שמור שינויים
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900">אימות דו-שלבי (2FA)</h3>
                  <p className="text-xs text-slate-500 mt-1">אבטח את החשבון שלך באמצעות קוד זמני באפליקציית מאמת.</p>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">אפליקציית אימות (מומלץ)</p>
                      <p className="text-xs text-slate-500">Google Authenticator או Authy</p>
                    </div>
                  </div>
                  
                  {/* Modern Toggle */}
                  <button 
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative",
                      is2FAEnabled ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                      is2FAEnabled ? "left-1 translate-x-0" : "right-1 -translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-base font-black text-slate-900 mb-4">שינוי סיסמה</h3>
                  <div className="space-y-4 max-w-md">
                    <input type="password" placeholder="סיסמה נוכחית" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-500 transition-all" />
                    <input type="password" placeholder="סיסמה חדשה" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-500 transition-all" />
                    <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all">
                      עדכן סיסמה
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-black text-rose-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> אזור מסוכן
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  מחיקת החשבון תסיר את הגישה שלך מכל מערכות הליבה. לא ניתן לבטל פעולה זו.
                </p>
                <button className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all">
                  מחק חשבון לצמיתות
                </button>
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === "sessions" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">סשנים פעילים</h3>
                  <p className="text-xs text-slate-500 mt-1">מכשירים ודפדפנים המחוברים כעת לחשבון שלך.</p>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {/* Current Session */}
                  <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <MonitorSmartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">Windows 11 • Chrome</p>
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded border border-emerald-100">Current</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">IP: 192.168.1.44 • Tel Aviv, IL</p>
                      </div>
                    </div>
                  </div>

                  {/* Other Session */}
                  <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">iOS 17 • Safari</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">IP: 84.110.22.1 • Haifa, IL • Last active 2h ago</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API TAB */}
          {activeTab === "api" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">מפתחות API</h3>
                    <p className="text-xs text-slate-500 mt-1">נהל גישה פרוגרמטית למערכות AMK Cloud.</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    צור מפתח חדש
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="py-3 px-4 font-bold">שם מפתח</th>
                          <th className="py-3 px-4 font-bold">הרשאות</th>
                          <th className="py-3 px-4 font-bold">שימוש אחרון</th>
                          <th className="py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-blue-500" /> NOC Reporting
                          </td>
                          <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-[9px]">Read-Only</span></td>
                          <td className="py-3 px-4 text-slate-500">היום, 14:30</td>
                          <td className="py-3 px-4 text-left">
                            <button className="text-slate-400 hover:text-slate-900"><MoreVertical className="w-4 h-4" /></button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-blue-500" /> CI/CD Deploy
                          </td>
                          <td className="py-3 px-4"><span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded font-mono text-[9px]">Full Access</span></td>
                          <td className="py-3 px-4 text-slate-500">לפני יומיים</td>
                          <td className="py-3 px-4 text-left">
                            <button className="text-slate-400 hover:text-slate-900"><MoreVertical className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholders for others */}
          {(activeTab === "notifications" || activeTab === "preferences") && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Activity className="w-12 h-12 text-slate-200 mb-4" />
              <h3 className="text-slate-900 font-black">הגדרות בבנייה</h3>
              <p className="text-xs text-slate-500 mt-1">אזור זה מפותח כעת ויהיה זמין בעדכון המערכת הבא.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
