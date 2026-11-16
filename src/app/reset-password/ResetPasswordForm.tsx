"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";

const MIN_PASSWORD_LENGTH = 8;

const inputClass =
  "w-full h-14 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-2xl pr-12 pl-12 text-slate-900 placeholder:text-slate-400 font-semibold text-sm transition-all outline-none";

export default function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const linkIsMissing = !token || !email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים.`);
      return;
    }
    if (password !== confirm) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || "לא ניתן לעדכן את הסיסמה כרגע.");
        return;
      }
      setDone(true);
    } catch {
      setError("לא ניתן לעדכן את הסיסמה כרגע. בדקו את החיבור לאינטרנט ונסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-tr from-slate-50 via-blue-50/15 to-indigo-50/20 flex items-center justify-center p-4 md:p-8 font-heebo"
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.06)] p-8 md:p-10">
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/logo.png"
            alt="AMK Cloud Technologies"
            width={170}
            height={40}
            priority
            className="h-auto object-contain"
          />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">בחירת סיסמה חדשה</h1>
          {!done && !linkIsMissing && (
            <p className="text-slate-500 font-semibold text-sm leading-relaxed" dir="auto">
              עבור <span dir="ltr">{email}</span>
            </p>
          )}
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="p-4 w-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-sm font-bold rounded-2xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              הסיסמה עודכנה בהצלחה.
            </div>
            <Link
              href="/login"
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base flex items-center justify-center transition-colors"
            >
              מעבר להתחברות
            </Link>
          </div>
        ) : linkIsMissing ? (
          <div className="p-4 bg-red-50 border border-red-200/80 text-red-600 text-sm font-bold rounded-2xl text-center">
            הקישור אינו שלם. יש לפתוח את הקישור המלא מהאימייל, או לבקש קישור חדש ממסך ההתחברות.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p role="alert" className="p-4 bg-red-50 border border-red-200/80 text-red-600 text-xs font-bold rounded-2xl text-center">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-xs font-black text-slate-500 mr-1.5 block">
                סיסמה חדשה
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                  className={inputClass}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "הסתרת סיסמה" : "הצגת סיסמה"}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold mr-1.5">לפחות {MIN_PASSWORD_LENGTH} תווים</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-xs font-black text-slate-500 mr-1.5 block">
                אימות סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={inputClass}
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-colors disabled:bg-slate-100 disabled:text-slate-400"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "שמירת סיסמה חדשה"}
            </button>
          </form>
        )}

        <div className="mt-8 pt-5 border-t border-slate-100/80 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-black text-xs transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            חזרה להתחברות
          </Link>
        </div>
      </div>
    </main>
  );
}
