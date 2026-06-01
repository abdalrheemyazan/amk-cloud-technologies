"use client";

import { useState } from "react";
import { 
  ArrowRight, 
  Send, 
  Paperclip, 
  AlertCircle,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewTicket() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock submission
    setTimeout(() => {
      setLoading(false);
      router.push("/tickets");
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Background soft glow gradient */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50/30 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <header>
        <Link href="/tickets" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 group text-xs font-bold">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          חזרה לקריאות שירות
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">פתיחת קריאת <span className="text-blue-600">שירות חדשה</span></h1>
        <p className="text-slate-550 text-sm font-semibold">אנא מלא את כל הפרטים כדי שנוכל לעזור לך בצורה הטובה ביותר.</p>
      </header>

      <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-sm shadow-slate-100/40 relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-right">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-450 mr-1 block">קטגוריה</label>
              <div className="relative">
                <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 transition-all cursor-pointer text-xs font-bold">
                  <option>תשתית ענן</option>
                  <option>שרתי VPS</option>
                  <option>אחסון וגיבוי</option>
                  <option>אבטחת מידע</option>
                  <option>תמיכת IT כללית</option>
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-450 mr-1 block">עדיפות</label>
              <div className="relative">
                <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 transition-all cursor-pointer text-xs font-bold">
                  <option>נמוכה</option>
                  <option>בינונית</option>
                  <option>גבוהה</option>
                  <option>דחופה (P0)</option>
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-450 mr-1 block">נושא הפנייה</label>
            <input 
              type="text" 
              placeholder="לדוגמה: שגיאת התחברות לשרת מסד הנתונים"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 transition-all text-xs font-bold"
              required
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-450 mr-1 block">תיאור הבעיה</label>
            <textarea 
              rows={5}
              placeholder="תאר בפירוט את הבעיה, כולל צעדים לשחזור אם רלוונטי..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 transition-all resize-none text-xs font-semibold leading-relaxed"
              required
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
            <button 
              type="button" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all"
            >
              <Paperclip className="w-4 h-4 text-slate-400" />
              צרף קבצים או צילומי מסך
            </button>
            
            <div className="text-[11px] text-slate-400 font-semibold text-center sm:text-right">
              ניתן לצרף עד 3 קבצים (PNG, JPG, PDF) בנפח של עד 10MB.
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-100/60 active:scale-98 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
            >
              {loading ? "שולח קריאה..." : "שליחת קריאת שירות"}
              {!loading && <Send className="w-4 h-4 rotate-180" />}
            </button>
          </div>
        </form>

        <div className="mt-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3 text-right">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-black text-blue-700">טיפ מה-AI שלנו</p>
            <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
              הוספת מזהי שרתים או הודעות שגיאה מדויקות תעזור לצוות התמיכה שלנו לפתור את הבעיה מהר יותר.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
