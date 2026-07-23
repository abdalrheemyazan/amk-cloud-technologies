import Link from "next/link";
import { Building2, FileQuestion, Mail, MessageCircle, MessagesSquare, PlusCircle } from "lucide-react";
import CustomerPortalPageShell from "./CustomerPortalPageShell";

const CONTACT_TOPICS = [
  { icon: MessagesSquare, title: "תמיכה טכנית", text: "תקלה, חיבור, שרת או סביבת עבודה" },
  { icon: Building2, title: "חשבון ושירותים", text: "פרטי חברה, שירות קיים או שירות חדש" },
  { icon: FileQuestion, title: "מסמכים וחיובים", text: "מסמכי שירות, הסכמים או בירור כללי" },
];

export default function CustomerContactSection() {
  return (
    <CustomerPortalPageShell
      title="צור קשר עם AMK"
      description="פנה אלינו בנושא שירותים, חשבון, מסמכים או תמיכה טכנית."
      eyebrow="ערוץ קשר ישיר"
      icon={Mail}
      tone="cyan"
      backHref="/portal"
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 sm:p-6">
          <p className="text-sm font-black text-slate-950">איך נוכל לעזור?</p>
          <p className="mt-1 text-xs font-semibold leading-6 text-slate-500">
            בחר את הערוץ המתאים. פנייה דרך הפורטל נשמרת בחשבון ומאפשרת מעקב מלא אחר הטיפול.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/portal/new-request"
              className="group rounded-2xl border border-blue-200 bg-blue-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-black text-blue-950">פתיחת פנייה מסודרת</p>
              <p className="mt-1 text-[11px] font-semibold leading-5 text-blue-800/75">הבחירה המומלצת לתקלה או בקשת שירות שדורשת מעקב.</p>
            </Link>

            <Link
              href="/portal/chat"
              className="group rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-black text-cyan-950">צ׳אט תמיכה</p>
              <p className="mt-1 text-[11px] font-semibold leading-5 text-cyan-800/75">לשאלה מהירה, הכוונה ראשונית או מעבר לנציג אנושי.</p>
            </Link>
          </div>

          <a
            href="mailto:support@amk-cloud.com"
            className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-wide text-slate-400">דוא״ל</span>
              <span className="block truncate text-xs font-black text-slate-900" dir="ltr">support@amk-cloud.com</span>
            </span>
          </a>
        </section>

        <aside className="rounded-[22px] border border-slate-200 bg-slate-950 p-5 text-white sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">ניתוב חכם</p>
          <h2 className="mt-2 text-lg font-black">מה נושא הפנייה?</h2>
          <div className="mt-5 space-y-3">
            {CONTACT_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <div key={topic.title} className="flex items-start gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-black">{topic.title}</p>
                    <p className="mt-0.5 text-[10px] font-semibold leading-5 text-slate-400">{topic.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[10px] font-semibold leading-5 text-slate-300">
            צוות התמיכה מטפל בפניות בימי ראשון–חמישי. פניות דחופות נשמרות בתור גם כשאין נציג זמין.
          </p>
        </aside>
      </div>
    </CustomerPortalPageShell>
  );
}
