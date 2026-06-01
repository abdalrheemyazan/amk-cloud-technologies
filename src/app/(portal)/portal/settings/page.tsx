"use client";

import { useState, useEffect, FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle, Bell, Globe, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomerSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState("he");
  const [preferredTheme, setPreferredTheme] = useState("light");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/portal/settings");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "שגיאה בטעינת ההגדרות");
        }
        if (data.settings) {
          setEmailNotifications(data.settings.emailNotifications);
          setMonthlyReport(data.settings.monthlyReport);
          setPreferredLanguage(data.settings.preferredLanguage);
          setPreferredTheme(data.settings.preferredTheme);
        }
      } catch (err: any) {
        setError(err.message || "אירעה שגיאה בטעינת ההגדרות");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/portal/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredLanguage,
          preferredTheme,
          emailNotifications,
          monthlyReport,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "אירעה שגיאה בעדכון ההגדרות");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה בשמירת השינויים");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm font-semibold">טוען את ההגדרות שלך...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-2">הגדרות חשבון</h1>
        <p className="text-slate-500 text-sm">הتאם אישית את הגדרות המערכת וההתראות עבורך.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">ההגדרות נשמרו בהצלחה!</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            התראות ותקשורת
          </h3>
          <div className="space-y-4 pr-1">
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors"
              />
              <span className="text-slate-700 font-semibold group-hover:text-slate-900 transition-colors">
                קבלת התראות במייל על קריאות חדשות
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={monthlyReport}
                onChange={(e) => setMonthlyReport(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors"
              />
              <span className="text-slate-700 font-semibold group-hover:text-slate-900 transition-colors">
                קבל דוח סיכום פעילות חודשי
              </span>
            </label>
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            הגדרות שפה ותצוגה
          </h3>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-semibold">
            תכונה זו עדיין בבדיקה ואינה פעילה כרגע
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 pointer-events-none">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">שפת ממשק</label>
              <select
                value={preferredLanguage}
                disabled
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 cursor-not-allowed outline-none transition-all font-semibold text-slate-800"
              >
                <option value="he">עברית</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-slate-500" />
                ערכת נושא
              </label>
              <select
                value={preferredTheme}
                disabled
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 cursor-not-allowed outline-none transition-all font-semibold text-slate-800"
              >
                <option value="light">בהיר (Light)</option>
                <option value="dark">כהה (Dark)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-sm active:scale-98"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                שומר...
              </>
            ) : (
              "שמור שינויים"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
