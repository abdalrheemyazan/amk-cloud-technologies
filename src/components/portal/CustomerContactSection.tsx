"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  Clock,
  Copy,
  FileQuestion,
  Headphones,
  Mail,
  MessagesSquare,
  PhoneCall,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { SUPPORT_CONTACT_CONFIG } from "@/lib/contact-config";
import CustomerPortalPageShell from "./CustomerPortalPageShell";

const CONTACT_TOPICS = [
  { icon: MessagesSquare, title: "תמיכה טכנית", text: "תקלה, חיבור, שרת או סביבת עבודה" },
  { icon: Building2, title: "חשבון ושירותים", text: "פרטי חברה, שירות קיים או שירות חדש" },
  { icon: FileQuestion, title: "מסמכים וחיובים", text: "מסמכי שירות, הסכמים או בירור כללי" },
];

export default function CustomerContactSection() {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  function handleCopyPhone() {
    navigator.clipboard.writeText(SUPPORT_CONTACT_CONFIG.phoneDisplay);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText(SUPPORT_CONTACT_CONFIG.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  }

  return (
    <CustomerPortalPageShell
      title="צור קשר עם AMK"
      description="פנה אלינו בנושא שירותים, חשבון, מסמכים או תמיכה טכנית."
      eyebrow="ערוץ קשר ישיר"
      icon={Mail}
      tone="cyan"
      backHref="/portal"
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        {/* Main contact channels */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-black text-slate-950">איך נוכל לעזור היום?</h2>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
              בחר את ערוץ ההתקשרות הנוח לך. פנייה מקוונת נשמרת בחשבון ומאפשרת מעקב ישיר אחר סטטוס הטיפול.
            </p>
          </div>

          {/* Quick Action Tiles */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Link
              href="/portal/new-request"
              prefetch={true}
              className="group flex flex-col justify-between rounded-2xl border border-blue-200 bg-gradient-to-bl from-blue-50/90 to-indigo-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
                  <PlusCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-3.5 text-sm font-black text-blue-950">פתיחת פנייה מסודרת</p>
                <p className="mt-1 text-[11px] font-medium leading-5 text-blue-800/80">
                  הערוץ המומלץ לכל תקלה או בקשת שירות עם תיעוד והקצאת נציג.
                </p>
              </div>
              <span className="mt-3 text-xs font-black text-blue-700 flex items-center gap-1">
                פתח פנייה חדשה ←
              </span>
            </Link>

            <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-gradient-to-bl from-emerald-50/80 to-teal-50/50 p-4 shadow-2xs">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Headphones className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-3.5 text-sm font-black text-emerald-950">עוזר תמיכה חכם וצ׳אט</p>
                <p className="mt-1 text-[11px] font-medium leading-5 text-emerald-800/80">
                  לחץ על כפתור העוזר בפינה הימנית למענה ממאגר הידע או העברה לנציג חי.
                </p>
              </div>
              <span className="mt-3 text-xs font-black text-emerald-700">
                זמין 24/7 בתחתית המסך
              </span>
            </div>
          </div>

          {/* Direct Contact Cards */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              פרטי יצירת קשר ישירים
            </h3>

            {/* Phone Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 transition-all hover:border-blue-200 hover:bg-slate-50/60">
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <PhoneCall className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wide text-slate-400">
                    מוקד טלפוני ישיר
                  </span>
                  <a
                    href={`tel:${SUPPORT_CONTACT_CONFIG.phoneE164}`}
                    className="text-sm font-black text-slate-900 hover:text-blue-600 transition-colors tracking-wide"
                    dir="ltr"
                  >
                    {SUPPORT_CONTACT_CONFIG.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${SUPPORT_CONTACT_CONFIG.phoneE164}`}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-black text-white transition-colors shadow-xs"
                >
                  חיוג עכשיו
                </a>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  title="העתק מספר טלפון"
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {copiedPhone ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                  <span>{copiedPhone ? "הועתק!" : "העתק"}</span>
                </button>
              </div>
            </div>

            {/* Email Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 transition-all hover:border-blue-200 hover:bg-slate-50/60">
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wide text-slate-400">
                    דואר אלקטרוני
                  </span>
                  <a
                    href={`mailto:${SUPPORT_CONTACT_CONFIG.email}`}
                    className="text-sm font-black text-slate-900 hover:text-blue-600 transition-colors"
                    dir="ltr"
                  >
                    {SUPPORT_CONTACT_CONFIG.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${SUPPORT_CONTACT_CONFIG.email}`}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors"
                >
                  שלח מייל
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  title="העתק כתובת אימייל"
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                  <span>{copiedEmail ? "הועתק!" : "העתק"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar Info */}
        <aside className="rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white space-y-6 shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
              ניתוב חכם וזמינות
            </p>
            <h2 className="mt-1.5 text-base font-black">מה נושא הפנייה?</h2>
          </div>

          <div className="space-y-3.5">
            {CONTACT_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <div
                  key={topic.title}
                  className="flex items-start gap-3 border-b border-white/10 pb-3.5 last:border-0 last:pb-0"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-black">{topic.title}</p>
                    <p className="mt-0.5 text-[11px] font-medium leading-5 text-slate-400">
                      {topic.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[11px]">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Clock className="h-4 w-4" />
              <span>שעות פעילות: {SUPPORT_CONTACT_CONFIG.workingHours}</span>
            </div>
            <p className="font-medium text-slate-300 leading-relaxed pt-1">
              פניות דחופות מטופלות לפי אמנת השירות (SLA) גם מחוץ לשעות הפעילות עבור לקוחות עם שירות מנוהל.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>כל הפניות מוצפנות ומאובטחות בתקן ISO 27001</span>
          </div>
        </aside>
      </div>
    </CustomerPortalPageShell>
  );
}
