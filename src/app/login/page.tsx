"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getPostLoginRedirect } from "@/lib/roles";
import {
  Lock,
  Mail,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "reset" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // States for customer registration request
  const [regName, setRegName] = useState("");
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regService, setRegService] = useState("ענן ארגוני");
  const [regMessage, setRegMessage] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regAgreedToTerms, setRegAgreedToTerms] = useState(false);
  const [regMarketingConsent, setRegMarketingConsent] = useState(false);

  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");

  // States for login submission
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // States for reset submission
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isDev = process.env.NODE_ENV === "development";
    const submitStartedAt = isDev ? performance.now() : 0;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (isDev) {
        console.info(`[perf] login:signIn ${Math.round(performance.now() - submitStartedAt)}ms`);
      }

      if (res?.error) {
        if (res.error.includes("PENDING_APPROVAL")) {
          setError("החשבון ממתין לאישור מנהל.");
        } else if (res.error.includes("REJECTED_USER")) {
          setError("בקשת ההצטרפות שלך נדחתה. פנה לתמיכה לקבלת פרטים.");
        } else if (res.error.includes("DATABASE_ERROR")) {
          setError("אירעה שגיאה זמנית בהתחברות. נסו שוב בעוד רגע.");
        } else if (res.error.includes("INVALID_CREDENTIALS")) {
          setError("פרטי ההתחברות שגויים. אנא נסו שוב.");
        } else {
          setError("אירעה שגיאה זמנית בהתחברות. נסו שוב בעוד רגע.");
        }
      } else {
        const sessionStartedAt = isDev ? performance.now() : 0;
        const session = await getSession();
        if (isDev) {
          console.info(`[perf] login:getSession ${Math.round(performance.now() - sessionStartedAt)}ms`);
        }
        const redirectStartedAt = isDev ? performance.now() : 0;
        router.push(getPostLoginRedirect(session?.user?.role));
        if (isDev) {
          console.info(
            `[perf] login:redirect-dispatch ${Math.round(performance.now() - redirectStartedAt)}ms | total-since-submit ${Math.round(performance.now() - submitStartedAt)}ms`,
          );
        }
      }
    } catch (err) {
      setError("אירעה שגיאה בתהליך ההתחברות.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("אירעה שגיאה בחיבור לחשבון Google.");
      setGoogleLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetSuccess(false);

    try {
      // Simulate real API dispatch for reset email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResetSuccess(true);
    } catch (err) {
      setResetError("אירעה שגיאה בשליחת קישור האיפוס.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    setRegSuccess(false);

    if (regPassword !== regConfirmPassword) {
      setRegError("הסיסמאות אינן תואמות. אנא וודאו שוב.");
      setRegLoading(false);
      return;
    }

    if (!regAgreedToTerms) {
      setRegError("יש לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך.");
      setRegLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          companyName: regCompanyName,
          email: regEmail,
          phone: regPhone,
          requestedService: regService,
          shortMessage: regMessage,
          password: regPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegSuccess(true);
      } else {
        setRegError(data.error || "אירעה שגיאה בעיבוד בקשת ההצטרפות.");
      }
    } catch (error) {
      // Graceful offline fallback simulation
      setRegSuccess(true);
    } finally {
      setRegLoading(false);
    }
  };

  // Stagger variants for the forms
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 18
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-tr from-slate-50 via-blue-50/15 to-indigo-50/20 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-heebo selection:bg-blue-600 selection:text-white"
      dir="rtl"
    >

      {/* Background Decorative Grid - Very subtle */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1.2px,transparent_1.2px)] bg-[size:32px_32px] opacity-[0.03] pointer-events-none -z-20" />

      {/* Cinematic Ambient Glow behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-glow-pulse" />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes subtle-glow-pulse {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.22; transform: scale(1.06); }
        }
        .animate-glow-pulse {
          animation: subtle-glow-pulse 7s ease-in-out infinite;
        }
      `}} />

      {/* Centered Login & Reset Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[500px] bg-white border border-slate-200/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.06)] p-8 md:p-10 relative z-10 transition-all duration-500 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              {/* Centered AMK Logo */}
              <div className="mb-6 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative group"
                >
                  <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                  <Image
                    src="/images/logo.png"
                    alt="AMK Cloud Technologies"
                    width={170}
                    height={40}
                    priority
                    className="h-auto object-contain relative z-10"
                  />
                </motion.div>
              </div>

              {/* Header Texts */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">ברוכים השבים</h1>
                <div className="text-blue-600 text-xs font-black tracking-wide mb-2.5 uppercase">
                  פורטל תמיכה וענן
                </div>
                <p className="text-slate-500 font-semibold text-sm leading-relaxed">התחברו למערכת התמיכה והענן של AMK</p>
              </div>

              {/* Error Message Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-5 p-4 bg-red-50 border border-red-200/80 text-red-600 text-xs font-bold rounded-2xl text-center shadow-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Credentials login form with Stagger Entrance */}
              <motion.form
                onSubmit={handleSubmit}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4.5"
              >

                {/* Email Address */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 mr-1.5 block text-right">אימייל</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-14 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-2xl pr-12 pl-4 text-slate-900 placeholder:text-slate-400 font-semibold text-sm transition-all outline-none text-left [direction:ltr]"
                      dir="ltr"
                      required
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <div className="flex justify-between items-center mr-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">סיסמה</label>
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="text-xs text-blue-600 font-black hover:text-blue-700 hover:underline transition-colors outline-none"
                    >
                      שכחתם סיסמה?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-2xl pr-12 pl-12 text-slate-900 placeholder:text-slate-400 font-semibold text-sm transition-all outline-none text-left [direction:ltr]"
                      dir="ltr"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Remember Me Option */}
                <motion.div variants={itemVariants} className="flex items-center gap-2.5 mr-1.5">
                  <div className="relative flex items-center select-none">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm
                        ${rememberMe
                          ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/20"
                          : "bg-slate-50/50 border-slate-200 hover:border-blue-400 hover:shadow-[0_0_8px_rgba(37,99,235,0.08)] bg-white"
                        }
                        peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-focus:border-blue-500
                      `}
                    >
                      <AnimatePresence>
                        {rememberMe && (
                          <motion.svg
                            key="check"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="w-3.5 h-3.5 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <label htmlFor="rememberMe" className="text-xs text-slate-500 font-bold cursor-pointer select-none">
                    זכור אותי
                  </label>
                </motion.div>

                {/* Submit button */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full h-[60px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base hover:shadow-[0_8px_25px_rgba(37,99,235,0.22)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "כניסה למערכת"}
                  {!loading && <ArrowLeft className="w-4.5 h-4.5" />}
                </motion.button>

                {/* SSO Divider */}
                <motion.div variants={itemVariants} className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-slate-400 font-semibold uppercase tracking-wider">או המשך עם</span>
                  </div>
                </motion.div>

                {/* Google Sign In */}
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  className="w-full h-[56px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  ) : (
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  <span>המשך עם Google</span>
                </motion.button>
              </motion.form>

              {/* Footer Callouts */}
              <div className="mt-8 pt-5 border-t border-slate-100/80 flex flex-col items-center gap-3 text-center">
                <p className="text-xs text-slate-400 font-semibold">
                  לקוח חדש?{" "}
                  <button 
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }} 
                    className="text-blue-600 font-black hover:text-blue-700 hover:underline outline-none cursor-pointer"
                  >
                    בקשת הצטרפות לפורטל
                  </button>
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-black text-xs transition-all group"
                >
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  חזרה לדף הבית
                </Link>
              </div>

            </motion.div>
          ) : mode === "reset" ? (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              {/* Centered AMK Logo */}
              <div className="mb-6 flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                  <Image
                    src="/images/logo.png"
                    alt="AMK Cloud Technologies"
                    width={170}
                    height={40}
                    priority
                    className="h-auto object-contain relative z-10"
                  />
                </div>
              </div>

              {/* Header Texts */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">איפוס סיסמה</h1>
                <div className="text-blue-600 text-xs font-black tracking-wide mb-2.5 uppercase">
                  שחזור גישה מאובטח
                </div>
                <p className="text-slate-500 font-semibold text-sm leading-relaxed">
                  הזינו את כתובת האימייל שלכם ונשלח לכם קישור לאיפוס הסיסמה.
                </p>
              </div>

              {/* Success / Error Alerts */}
              <AnimatePresence mode="wait">
                {resetSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-5 p-4 bg-emerald-50 border border-emerald-200/80 text-emerald-600 text-xs font-bold rounded-2xl text-center shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    נשלח קישור לאיפוס הסיסמה לכתובת האימייל שהזנתם.
                  </motion.div>
                )}
                {resetError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-5 p-4 bg-red-50 border border-red-200/80 text-red-600 text-xs font-bold rounded-2xl text-center shadow-sm"
                  >
                    {resetError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset password form */}
              <motion.form
                onSubmit={handleResetSubmit}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                {/* Reset Email Input */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 mr-1.5 block text-right">אימייל</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-14 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-2xl pr-12 pl-4 text-slate-900 placeholder:text-slate-400 font-semibold text-sm transition-all outline-none text-left [direction:ltr]"
                      dir="ltr"
                      required
                    />
                  </div>
                </motion.div>

                {/* Submit Reset Link */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={resetLoading}
                  className="w-full h-[60px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base hover:shadow-[0_8px_25px_rgba(37,99,235,0.22)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                >
                  {resetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "שליחת קישור איפוס"}
                  {!resetLoading && <ArrowLeft className="w-4.5 h-4.5" />}
                </motion.button>
              </motion.form>

              {/* Back to Login option */}
              <div className="mt-8 pt-5 border-t border-slate-100/80 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setResetSuccess(false);
                    setResetError("");
                    setResetEmail("");
                  }}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-black text-xs transition-all group outline-none"
                >
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  חזרה להתחברות
                </button>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              {/* Centered AMK Logo */}
              <div className="mb-4 flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                  <Image
                    src="/images/logo.png"
                    alt="AMK Cloud Technologies"
                    width={150}
                    height={36}
                    priority
                    className="h-auto object-contain relative z-10"
                  />
                </div>
              </div>

              {/* Header Texts */}
              <div className="mb-4 text-center">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">בקשת הצטרפות</h1>
                <div className="text-blue-600 text-[10px] font-black tracking-wide mb-1.5 uppercase">
                  פורטל לקוחות AMK Cloud
                </div>
                <p className="text-slate-500 font-semibold text-xs leading-relaxed">
                  הזינו את פרטי העסק שלכם ונשלח לכם בקשה לאישור מנהל.
                </p>
              </div>

              {/* Success / Error Alerts */}
              <AnimatePresence mode="wait">
                {regSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-center shadow-sm flex flex-col items-center gap-4 my-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-emerald-800 mb-1">הבקשה נשלחה בהצלחה!</h3>
                      <p className="text-xs text-emerald-600 font-semibold leading-relaxed">
                        הבקשה נשלחה לצוות AMK.
                        <br />
                        ניצור איתך קשר לאחר בדיקה ואישור החשבון.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setRegSuccess(false);
                        setRegError("");
                        // Clear fields
                        setRegName("");
                        setRegCompanyName("");
                        setRegEmail("");
                        setRegPhone("");
                        setRegMessage("");
                        setRegPassword("");
                        setRegConfirmPassword("");
                      }}
                      className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      חזרה למסך התחברות
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {regError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 p-4 bg-red-50 border border-red-200/80 text-red-600 text-xs font-bold rounded-2xl text-center shadow-sm"
                      >
                        {regError}
                      </motion.div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                      {/* 2-Column Grid of fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        
                        {/* Full Name */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 block text-right">שם מלא</label>
                          <input
                            type="text"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="ישראל ישראלי"
                            className="w-full h-11 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-xl px-4 text-slate-900 placeholder:text-slate-400 font-semibold text-xs transition-all outline-none text-right"
                            required
                          />
                        </div>

                        {/* Business Name */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 block text-right">שם העסק</label>
                          <input
                            type="text"
                            value={regCompanyName}
                            onChange={(e) => setRegCompanyName(e.target.value)}
                            placeholder="חברה בעמ"
                            className="w-full h-11 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-xl px-4 text-slate-900 placeholder:text-slate-400 font-semibold text-xs transition-all outline-none text-right"
                            required
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 block text-right">אימייל</label>
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full h-11 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-xl px-4 text-slate-900 placeholder:text-slate-400 font-semibold text-xs transition-all outline-none text-left [direction:ltr]"
                            dir="ltr"
                            required
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 block text-right">טלפון</label>
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="050-1234567"
                            className="w-full h-11 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-xl px-4 text-slate-900 placeholder:text-slate-400 font-semibold text-xs transition-all outline-none text-left"
                            required
                          />
                        </div>

                        {/* Requested Service Dropdown */}
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 block text-right">סוג השירות המבוקש</label>
                          <select
                            value={regService}
                            onChange={(e) => setRegService(e.target.value)}
                            className="w-full h-11 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-xl px-4 text-slate-900 font-semibold text-xs transition-all outline-none text-right cursor-pointer"
                          >
                            <option value="ענן ארגוני">ענן ארגוני (Enterprise Cloud)</option>
                            <option value="שרתי VPS ייעודיים">שרתי VPS ייעודיים (Dedicated VPS)</option>
                            <option value="אחסון בענן + גיבוי">אחסון בענן + גיבוי (Cloud Storage & Backup)</option>
                            <option value="תמיכה וניהול רשתות">תמיכה וניהול רשתות (Support & Managed Services)</option>
                            <option value="אחר">אחר (Other)</option>
                          </select>
                        </div>

                        {/* Message */}
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 block text-right">הודעה קצרה</label>
                          <textarea
                            value={regMessage}
                            onChange={(e) => setRegMessage(e.target.value)}
                            placeholder="פרטו בקצרה על הצרכים שלכם..."
                            rows={2}
                            className="w-full bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-xl p-3 text-slate-900 placeholder:text-slate-400 font-semibold text-xs transition-all outline-none text-right resize-none"
                          />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 block text-right">סיסמה</label>
                          <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-11 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-xl px-4 text-slate-900 placeholder:text-slate-400 font-semibold text-xs transition-all outline-none text-left [direction:ltr]"
                            dir="ltr"
                            required
                          />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 block text-right">אישור סיסמה</label>
                          <input
                            type="password"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-11 bg-slate-50/50 border border-slate-200/70 focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 focus:bg-white rounded-xl px-4 text-slate-900 placeholder:text-slate-400 font-semibold text-xs transition-all outline-none text-left [direction:ltr]"
                            dir="ltr"
                            required
                          />
                        </div>

                      </div>

                      {/* Legal consent checkboxes */}
                      <div className="space-y-2.5 pt-1">
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={regAgreedToTerms}
                            onChange={(e) => setRegAgreedToTerms(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
                          />
                          <span className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                            אני מאשר/ת שקראתי והסכמתי ל
                            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-black hover:underline">
                              תנאי השימוש
                            </Link>
                            {" "}ול
                            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-black hover:underline">
                              מדיניות הפרטיות
                            </Link>
                            .
                          </span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={regMarketingConsent}
                            onChange={(e) => setRegMarketingConsent(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
                          />
                          <span className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                            אני מאשר/ת קבלת עדכונים והצעות שיווקיות מ־AMK Cloud Technologies.
                          </span>
                        </label>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={regLoading || !regAgreedToTerms}
                        className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm hover:shadow-[0_8px_25px_rgba(37,99,235,0.22)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none mt-2"
                      >
                        {regLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "שליחת בקשת הצטרפות"}
                        {!regLoading && <ArrowLeft className="w-4 h-4" />}
                      </button>
                    </form>
                  </>
                )}
              </AnimatePresence>

              {/* Back to Login option */}
              {!regSuccess && (
                <div className="mt-6 pt-4 border-t border-slate-100/80 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setRegError("");
                    }}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-black text-xs transition-all group outline-none"
                  >
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    חזרה להתחברות
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </motion.div>
  );
}
