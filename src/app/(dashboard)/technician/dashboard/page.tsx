"use client";

import { 
  Terminal, 
  Shield, 
  Zap, 
  Laptop, 
  Cpu, 
  Activity, 
  MessageSquare, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  ClipboardList,
  Sparkles,
  User,
  Plus,
  Send
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function TechnicianDashboardPage() {
  const [activeSession, setActiveSession] = useState("S-209");
  const [presenceStatus, setPresenceStatus] = useState("AVAILABLE");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState([
    { id: 1, text: "בוצע איפוס להגדרות DNS במחשב הלקוח. נראה שהתקלה נפתרה בהצלחה.", date: "היום, 05:30", author: "יזן א." },
    { id: 2, text: "הלקוח מדווח על בעיות בחיבור ה-IPSec. ייתכן שיש לחסום פורט 500 בראוטר המקומי שלו.", date: "אתמול, 14:15", author: "יזן א." }
  ]);

  // Synchronize dynamic status updates directly with Prisma + Supabase
  const updatePresence = async (status: string, ticketId?: string, sessionId?: string) => {
    try {
      setPresenceStatus(status);
      await fetch("/api/technicians/presence/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          currentTicketId: ticketId || null,
          currentSupportSessionId: sessionId || null,
        }),
      });
    } catch (err) {
      console.error("Failed to sync presence with database:", err);
    }
  };

  // 1-Minute Heartbeat Loop to prevent the 5-minute inactivity trigger from going offline
  useEffect(() => {
    updatePresence("AVAILABLE");

    const interval = setInterval(() => {
      updatePresence(presenceStatus);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSessionChange = (id: string, status: string) => {
    setActiveSession(id);
    if (status === "בטיפול") {
      updatePresence("IN_TICKET", id);
    } else if (status === "פתור") {
      updatePresence("AVAILABLE");
    } else {
      updatePresence("ONLINE");
    }
  };

  const activeSessions = [
    { id: "S-209", customerName: "משה כהן", company: "אלפא בע\"מ", ticketTitle: "בעיית התחברות ל-VPN", status: "בטיפול", type: "תמיכה חיה" },
    { id: "S-210", customerName: "שרה לוי", company: "בטא טק", ticketTitle: "בקשה להגדלת נפח אחסון", status: "ממתין", type: "כרטיס רגיל" },
    { id: "S-211", customerName: "דוד מנחם", company: "גמא פיננסים", ticketTitle: "שדרוג גרסת מסד נתונים", status: "פתור", type: "תמיכה חיה" }
  ];

  const aiSuggestions = [
    { title: "איפוס הגדרות רשת (DNS/IP)", confidence: "94% התאמה", description: "הפעל פקודת ipconfig /flushdns לניקוי קש DNS מקומי." },
    { title: "בדיקת ניתוב שער ברירת מחדל", confidence: "87% התאמה", description: "וודא שכתובת ה-IP של שער ברירת המחדל מגיבה לפינגים." },
    { title: "אימות הרשאות משתמש ב-Active Directory", confidence: "75% התאמה", description: "בדוק אם לחשבון המשתמש יש הרשאה בקבוצת VPN-Allowed." }
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([
      {
        id: Date.now(),
        text: newNote,
        date: "היום, " + new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        author: "יזן א. (טכנאי)"
      },
      ...notes
    ]);
    setNewNote("");
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-black">
            <Shield className="w-4 h-4" />
            מרכז שליטה ובקרה לטכנאים
          </div>
          <h1 className="text-5xl font-black tracking-tight">מרחב <span className="text-gradient">טכנאי</span></h1>
          <p className="text-zinc-500 text-lg font-bold">ניהול קריאות תמיכה בזמן אמת, אבחון בעיות רשת מרוחקות וכלי סיוע AI.</p>
        </div>
      </header>

      {/* Control Room Panel Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        
        {/* Active Sessions Queue (1 Col) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-[2.5rem] border-white/5 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
              תור סשנים פעילים
            </h3>
            
            <div className="space-y-4">
              {activeSessions.map((session, i) => (
                <div 
                  key={i}
                  onClick={() => handleSessionChange(session.id, session.status)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-right space-y-3 ${activeSession === session.id ? "bg-indigo-600/10 border-indigo-500/40" : "bg-zinc-950/40 border-white/5 hover:border-white/10"}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-zinc-600 tracking-wider">{session.id}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${session.status === 'בטיפול' ? 'bg-blue-600/10 text-blue-500' : session.status === 'ממתין' ? 'bg-amber-600/10 text-amber-500' : 'bg-emerald-600/10 text-emerald-500'}`}>
                      {session.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">{session.customerName}</h4>
                    <span className="text-xs text-zinc-600 font-bold">{session.company}</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium truncate">{session.ticketTitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Central Diagnostics & AI Panel (2 Cols) */}
        <div className="xl:col-span-2 space-y-8">
          {/* Active Diagnostic Workspace */}
          <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-6 bg-gradient-to-b from-zinc-900/40 to-zinc-950/40">
            <div className="flex justify-between items-center border-b border-white/5 pb-5">
              <div className="space-y-1">
                <span className="text-xs text-indigo-400 font-black">סשן נוכחי בטיפול</span>
                <h3 className="text-2xl font-black text-white">אבחון טכנאי מרחוק עבור משה כהן</h3>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => updatePresence("IN_REMOTE_SESSION", undefined, activeSession)}
                  className="px-5 py-2.5 bg-zinc-950 border border-white/5 hover:bg-zinc-900 text-zinc-400 rounded-xl text-xs font-black transition-all"
                >
                  הפעל AnyDesk
                </button>
                <button 
                  onClick={() => updatePresence("IN_REMOTE_SESSION", undefined, activeSession)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all glow-indigo"
                >
                  בקש שליטה מרחוק
                </button>
              </div>
            </div>

            {/* Clean Audit Logs Console */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-3 min-h-[220px] overflow-y-auto">
              <p className="text-slate-450">// Connected to target server node: ALPHA-VPN-GW1</p>
              <p className="text-slate-450">// Port 443 open. VPN tunnel negotiation: ACTIVE</p>
              <p className="text-indigo-650 font-bold"># tail -f /var/log/openvpn/openvpn.log</p>
              <p className="text-slate-600">May 18 05:40:01 alpha-vpn openvpn[1204]: 192.168.1.14:49023 TLS: Initial packet from [AF_INET]192.168.1.14:49023, sid=12e0fa82</p>
              <p className="text-slate-600">May 18 05:40:02 alpha-vpn openvpn[1204]: 192.168.1.14:49023 TLS Error: TLS key negotiation failed to occur within 60 seconds (check your network connectivity)</p>
              <p className="text-rose-600 font-bold">May 18 05:40:02 alpha-vpn openvpn[1204]: 192.168.1.14:49023 TLS Error: TLS handshake failed</p>
              <p className="text-indigo-650 font-bold"># vpn-diag --diagnose-connection 192.168.1.14</p>
              <p className="text-emerald-650 font-bold">[FOUND] MTU size mismatch (1500 client vs 1420 server). Adjusting MTU...</p>
            </div>

            {/* Quick Diagnostic Utilities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-600 block">עומס מעבד מרוחק</span>
                  <span className="text-sm font-black text-emerald-400">14% (תקין)</span>
                </div>
                <Cpu className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-600 block">ניצול זיכרון</span>
                  <span className="text-sm font-black text-indigo-400">32% (תקין)</span>
                </div>
                <Activity className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-600 block">ערוץ מאובטח</span>
                  <span className="text-sm font-black text-blue-400">AES-GCM (מאובטח)</span>
                </div>
                <Lock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* AI-Assisted Diagnosis Suggestions */}
          <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              המלצות אבחון מבוססות AI
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiSuggestions.map((suggestion, i) => (
                <div key={i} className="p-5 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl text-right flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-indigo-400">{suggestion.confidence}</span>
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    </div>
                    <h4 className="text-sm font-black text-white leading-tight">{suggestion.title}</h4>
                    <p className="text-xs text-zinc-600 font-bold leading-relaxed">{suggestion.description}</p>
                  </div>
                  <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black transition-all">
                    הפעל בדיקה
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technician Session Notes & History (1 Col) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-500" />
                הערות טכנאי פנימיות
              </h3>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="הקלד הערת עבודה פנימית..."
                  className="w-full h-24 bg-zinc-950/80 border border-white/10 rounded-xl p-4 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/20 transition-all text-right resize-none"
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition-all glow-indigo flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  הוסף הערה
                </button>
              </form>

              {/* Notes List */}
              <div className="space-y-4 overflow-y-auto max-h-[300px] p-1">
                {notes.map((note, i) => (
                  <div key={i} className="p-4 bg-zinc-950/60 border border-white/5 rounded-xl text-right space-y-2">
                    <p className="text-xs text-zinc-300 font-medium leading-relaxed">{note.text}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600">
                      <span>{note.author}</span>
                      <span>{note.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
