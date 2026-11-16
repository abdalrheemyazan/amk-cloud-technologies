"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company, subject, message, website }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || "לא ניתן לשלוח את הפנייה כרגע. נסו שוב מאוחר יותר.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("לא ניתן לשלוח את הפנייה כרגע. בדקו את החיבור לאינטרנט ונסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-5.5 h-5.5" />
        </div>
        <p className="text-sm font-black text-emerald-800">הפנייה נשלחה בהצלחה!</p>
        <p className="text-xs text-emerald-700 font-semibold">ניצור איתך קשר בהקדם האפשרי.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-[#64748B] block">שם מלא</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-11 bg-[#F4F7FB] border border-[#E2E8F0] focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 rounded-xl px-3.5 text-sm text-[#0F172A] outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-[#64748B] block">אימייל</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            className="w-full h-11 bg-[#F4F7FB] border border-[#E2E8F0] focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 rounded-xl px-3.5 text-sm text-[#0F172A] outline-none transition-all text-left"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-[#64748B] block">טלפון</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-11 bg-[#F4F7FB] border border-[#E2E8F0] focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 rounded-xl px-3.5 text-sm text-[#0F172A] outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-[#64748B] block">שם חברה</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full h-11 bg-[#F4F7FB] border border-[#E2E8F0] focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 rounded-xl px-3.5 text-sm text-[#0F172A] outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-black text-[#64748B] block">נושא הפנייה</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full h-11 bg-[#F4F7FB] border border-[#E2E8F0] focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 rounded-xl px-3.5 text-sm text-[#0F172A] outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-black text-[#64748B] block">הודעה</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full bg-[#F4F7FB] border border-[#E2E8F0] focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 rounded-xl p-3.5 text-sm text-[#0F172A] outline-none transition-all resize-none"
          />
        </div>
      </div>

      {/* Honeypot for bots — hidden from people and screen readers */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        שליחת פנייה
      </button>
    </form>
  );
}
