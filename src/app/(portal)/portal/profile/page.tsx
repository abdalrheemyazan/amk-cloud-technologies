"use client";

import { useState, useEffect, FormEvent } from "react";
import { User, Phone, Building, Mail, Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  role: string;
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { update } = useSession();

  // Fetch current user profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/portal/profile");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "שגיאה בטעינת הנתונים");
        }
        if (data.profile) {
          setProfile(data.profile);
          setName(data.profile.name || "");
          setPhone(data.profile.phone || "");
          setCompanyName(data.profile.companyName || "");
        }
      } catch (err: any) {
        setError(err.message || "אירעה שגיאה בטעינת פרטי הפרופיל");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, companyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "אירעה שגיאה בעדכון הפרופיל");
      }

      setSuccess(true);
      if (data.profile) {
        setProfile(data.profile);
        await update({ name: data.profile.name });
      }

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
        <p className="text-slate-500 text-sm font-semibold">טוען את פרטי הפרופיל שלך...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-2">הפרופיל שלי</h1>
        <p className="text-slate-500 text-sm">כאן ניתן לעדכן פרטי חשבון, העדפות אישיות ופרטי התקשרות</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl shadow-sm uppercase select-none">
            {name?.[0] || "U"}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{name}</h2>
            <p className="text-slate-500 flex items-center gap-1.5 mt-1 font-medium" dir="ltr">
              <Mail className="w-4 h-4 text-slate-400" />
              {profile?.email}
            </p>
            <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-full uppercase">
              {profile?.role === "CUSTOMER" ? "לקוח פורטל" : profile?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold">השינויים נשמרו בהצלחה!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">שם מלא</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pr-10 pl-4 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">מספר טלפון</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-10 pl-4 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800"
                  placeholder="לדוגמה: 050-1234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">שם החברה</label>
              <div className="relative">
                <Building className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pr-10 pl-4 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800"
                  placeholder="שם הארגון או העסק שלך..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">אימייל (אינו ניתן לשינוי)</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-350 w-5 h-5" />
                <input
                  type="email"
                  value={profile?.email}
                  className="w-full pr-10 pl-4 p-3 rounded-xl border border-slate-200 bg-slate-100 cursor-not-allowed outline-none font-medium text-slate-400"
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">תפקיד מערכת (אינו ניתן לשינוי)</label>
              <div className="relative">
                <Shield className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-350 w-5 h-5" />
                <input
                  type="text"
                  value={profile?.role === "CUSTOMER" ? "לקוח קצה (Customer)" : profile?.role}
                  className="w-full pr-10 pl-4 p-3 rounded-xl border border-slate-200 bg-slate-100 cursor-not-allowed outline-none font-medium text-slate-400"
                  readOnly
                  disabled
                />
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
                  שומר שינויים...
                </>
              ) : (
                "שמור שינויים"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
