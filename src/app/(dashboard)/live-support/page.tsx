"use client";

import { 
  Play, 
  Shield, 
  Activity, 
  MessageSquare, 
  Zap, 
  Laptop, 
  Cpu, 
  Wifi, 
  Lock, 
  Send,
  User,
  Clock
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LiveSupportPage() {
  const [sessionStatus, setSessionStatus] = useState("idle"); // idle, searching, connected
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<any[]>([
    { sender: "system", name: "מערכת AMK", content: "חיבור התמיכה החיה שלך אותחל בהצלחה. טכנאי בכיר יתחבר מיד ויעזור לך בפתרון הבעיה.", time: "10:02", isSystem: true }
  ]);

  const telemetryMetrics = [
    { label: "רוחב פס ערוץ", value: "85 Mbps", status: "מעולה", icon: Wifi, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "עומס מעבד מרוחק", value: "14%", status: "תקין", icon: Cpu, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { label: "רמת הצפנה", value: "AES-256", status: "מאובטח", icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
    { label: "זמן תגובה (RTT)", value: "12ms", status: "מהיר", icon: Activity, color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-100" }
  ];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    const newMsg = { sender: "user", name: "אתה", content: messageText, time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMsg]);
    setMessageText("");

    // Mock tech response after a second
    if (sessionStatus === "connected") {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: "tech",
          name: "יזן א. (טכנאי תמיכה)",
          content: "קיבלתי את ההודעה שלך, אני בודק את הגדרות הנתב וחיבור הרשת של השרת כעת.",
          time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1500);
    }
  };

  const handleStartSession = () => {
    setSessionStatus("searching");
    setTimeout(() => {
      setSessionStatus("connected");
      setMessages(prev => [...prev, {
        sender: "tech",
        name: "יזן א. (טכנאי תמיכה)",
        content: "שלום! אני רואה שיש לך תקלה בחיבור ה-VPN של המשרד. אשמח לסייע לך בפתרון הבעיה כעת.",
        time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20" dir="rtl">
      {/* Background radial gradient */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-blue-50/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1 text-right">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider">
            <Zap className="w-3 h-3 animate-pulse" />
            סיוע טכנאי בזמן אמת
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">תמיכה טכנית חיה</h1>
          <p className="text-slate-550 text-xs font-semibold">חיבור ישיר ומאובטח לצוות הטכני של AMK Cloud לפתרון בעיות בזמן אמת.</p>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Connection Control & Metrics (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Connection Controller Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="space-y-1 text-right">
              <h3 className="text-sm font-black text-slate-800">מצב חיבור</h3>
              <p className="text-slate-500 text-xs font-semibold">הפעל או נתק חיבור תמיכה מול חדר המצב.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
              {sessionStatus === "idle" && (
                <>
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <Laptop className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-700 block">ערוץ תמיכה מנותק</span>
                    <p className="text-[10px] text-slate-400 font-semibold">לחץ מטה כדי ליצור קשר עם טכנאי תמיכה</p>
                  </div>
                  <button 
                    onClick={handleStartSession}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm shadow-blue-100 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    התחל סשן תמיכה חיה
                  </button>
                </>
              )}

              {sessionStatus === "searching" && (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center animate-spin">
                    <Zap className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-blue-600 block">מחפש טכנאי פנוי...</span>
                    <p className="text-[10px] text-slate-400 font-semibold">מנתב את הקריאה לצוות ה-NOC המפעיל</p>
                  </div>
                  <button 
                    onClick={() => setSessionStatus("idle")}
                    className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
                  >
                    ביטול בקשה
                  </button>
                </>
              )}

              {sessionStatus === "connected" && (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center relative">
                    <User className="w-6 h-6 text-emerald-600 animate-pulse" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-emerald-600 block">מחובר - יזן א. (טכנאי בכיר)</span>
                    <p className="text-[10px] text-slate-400 font-semibold">ערוץ הצפנה מקצה לקצה פעיל</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSessionStatus("idle");
                      setMessages([{ sender: "system", name: "מערכת AMK", content: "חיבור התמיכה החיה שלך אותחל בהצלחה. טכנאי בכיר יתחבר מיד ויעזור לך בפתרון הבעיה.", time: "10:02", isSystem: true }]);
                    }}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl font-bold text-xs transition-all active:scale-98"
                  >
                    נתק סשן תמיכה
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Telemetry Metrics Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest text-right">חיבור וטלמטריה</h3>
            <div className="grid grid-cols-1 gap-3">
              {telemetryMetrics.map((metric, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg border", metric.bg)}>
                      <metric.icon className={cn("w-4 h-4", metric.color)} />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block leading-tight">{metric.label}</span>
                      <span className="text-xs font-black text-slate-800">{metric.value}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-500">
                    {metric.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Support Chat Console (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm min-h-[500px] overflow-hidden">
          {/* Header Panel */}
          <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black text-slate-800">צ'אט תמיכה טכנית</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>ערוץ תקשורת מוצפן</span>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 p-6 flex flex-col justify-between gap-6 bg-slate-50/20">
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] p-1 custom-scrollbar">
              {sessionStatus === "idle" ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                  <div className="space-y-0.5">
                    <p className="text-slate-800 font-black text-sm">אין סשן צ'אט פעיל</p>
                    <p className="text-slate-400 text-xs font-semibold max-w-xs">הפעל סשן תמיכה חיה כדי להתחיל להתכתב בצורה ישירה מול טכנאי.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "flex gap-3 max-w-md items-start",
                        msg.sender === "user" ? "mr-auto flex-row-reverse" : "ml-auto"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                        msg.sender === "user" ? "bg-blue-600 text-white" : 
                        msg.sender === "system" ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {msg.name[0]}
                      </div>
                      <div className={cn(
                        "p-3.5 border rounded-2xl space-y-0.5",
                        msg.sender === "user" ? "bg-blue-600 border-blue-500 text-white rounded-tl-none text-right font-medium" : 
                        msg.sender === "system" ? "bg-slate-100 border-slate-200 text-slate-700 rounded-tr-none text-right text-[11px]" :
                        "bg-white border-slate-200 text-slate-800 rounded-tr-none text-right font-medium"
                      )}>
                        <span className={cn("text-[9px] font-black block", msg.sender === "user" ? "text-blue-100" : msg.sender === "system" ? "text-slate-450" : "text-emerald-600")}>
                          {msg.name}
                        </span>
                        <p className="text-xs font-semibold leading-relaxed">{msg.content}</p>
                        <span className={cn("text-[8px] font-bold block text-left mt-1", msg.sender === "user" ? "text-blue-200" : "text-slate-400")}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Box Row */}
            <div className="relative group">
              <input 
                disabled={sessionStatus === "idle"}
                type="text" 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={sessionStatus === "idle" ? "התחל סשן כדי להקליד הודעה..." : "הקלד הודעה לטכנאי התמיכה..."}
                className="w-full bg-white border border-slate-250 rounded-xl pr-4 pl-16 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 transition-all text-right disabled:opacity-60 disabled:bg-slate-50"
              />
              <button 
                onClick={handleSendMessage}
                disabled={sessionStatus === "idle" || !messageText.trim()}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-lg transition-all shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
