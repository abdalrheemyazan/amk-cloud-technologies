"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, ListChecks, Send, ShieldCheck } from "lucide-react";
import { submitSupportRequest } from "@/lib/actions/support-chat-actions";
import { RELATED_SERVICE_OPTIONS } from "@/lib/support-request-options";
import { processSelectedFiles, type PendingAttachment } from "@/lib/chat-attachments-client";
import PendingAttachmentTray from "@/components/support/PendingAttachmentTray";
import CustomerPortalPageShell from "./CustomerPortalPageShell";

export default function CustomerNewRequestForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [relatedService, setRelatedService] = useState("");
  const [os, setOs] = useState("");
  const [browser, setBrowser] = useState("");
  const [device, setDevice] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setAttachmentError(null);
    const { attachments: added, error: fileError } = await processSelectedFiles(Array.from(fileList), attachments.length);
    if (fileError) {
      setAttachmentError(fileError);
      return;
    }
    setAttachments((prev) => [...prev, ...added]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);

    if (!title.trim() || !description.trim()) {
      setError("יש למלא כותרת ותיאור לפנייה.");
      return;
    }

    setSubmitting(true);
    const result = await submitSupportRequest({
      title,
      description,
      relatedService: relatedService || undefined,
      os: os || undefined,
      browser: browser || undefined,
      device: device || undefined,
      attachments,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(
      result.data.agentAvailable
        ? "הפנייה התקבלה ותסווג אוטומטית לפי תוכן התקלה והשפעתה. נציג תמיכה יצטרף לשיחה בקרוב."
        : "הפנייה התקבלה ותסווג אוטומטית לפי תוכן התקלה והשפעתה. אין נציג זמין כרגע, אך נחזור אליך בהקדם."
    );
    setTitle("");
    setDescription("");
    setRelatedService("");
    setOs("");
    setBrowser("");
    setDevice("");
    setAttachments([]);
    onSubmitted();
  }

  return (
    <CustomerPortalPageShell
      title="פתיחת פנייה חדשה"
      description="מלאו את הפרטים וננתב את הפנייה לנציג המתאים במהירות האפשרית."
      eyebrow="מסלול טיפול חדש"
      icon={ListChecks}
      tone="blue"
      badge="מעקב מלא בפורטל"
    >
      <form onSubmit={handleSubmit} className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="space-y-5 rounded-[22px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
        {success && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="text-xs font-bold">{success}</p>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="request-title" className="mb-1.5 block text-xs font-black text-[#0F172A]">
            כותרת הפנייה*
          </label>
          <input
            id="request-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="לדוגמה: לא ניתן להתחבר לשרת ה-VPN"
            className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-3.5 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label htmlFor="request-description" className="mb-1.5 block text-xs font-black text-[#0F172A]">
            תיאור הבעיה*
          </label>
          <textarea
            id="request-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={4000}
            rows={5}
            placeholder="תארו את הבעיה בפירוט — מתי היא מתחילה, מה ניסיתם ומה קורה בפועל."
            className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-3.5 py-2.5 text-sm leading-relaxed text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label htmlFor="request-service" className="mb-1.5 block text-xs font-black text-[#0F172A]">
            שירות קשור
          </label>
          <select
            id="request-service"
            value={relatedService}
            onChange={(e) => setRelatedService(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-3.5 text-sm font-semibold text-[#0F172A] outline-none transition-colors focus:border-blue-500 focus:bg-white"
          >
            <option value="">לא ידוע / כללי</option>
            {RELATED_SERVICE_OPTIONS.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-[#94A3B8]">
            אין צורך לבחור רמת דחיפות — הפנייה תסווג אוטומטית לפי תוכן התקלה והשפעתה.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="request-os" className="mb-1.5 block text-xs font-black text-[#0F172A]">
              מערכת הפעלה <span className="font-semibold text-[#94A3B8]">(אופציונלי)</span>
            </label>
            <input
              id="request-os"
              value={os}
              onChange={(e) => setOs(e.target.value)}
              maxLength={60}
              placeholder="Windows 11"
              className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-3 text-xs font-semibold text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label htmlFor="request-browser" className="mb-1.5 block text-xs font-black text-[#0F172A]">
              דפדפן <span className="font-semibold text-[#94A3B8]">(אופציונלי)</span>
            </label>
            <input
              id="request-browser"
              value={browser}
              onChange={(e) => setBrowser(e.target.value)}
              maxLength={60}
              placeholder="Chrome"
              className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-3 text-xs font-semibold text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label htmlFor="request-device" className="mb-1.5 block text-xs font-black text-[#0F172A]">
              מכשיר <span className="font-semibold text-[#94A3B8]">(אופציונלי)</span>
            </label>
            <input
              id="request-device"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              maxLength={60}
              placeholder="מחשב נייד"
              className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-3 text-xs font-semibold text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-black text-[#0F172A]">צרף צילום מסך</label>
          <p className="mb-2 text-[11px] font-semibold leading-relaxed text-[#94A3B8]">
            ניתן לצרף צילומי מסך או תמונות כדי לעזור לנו להבין את הבעיה טוב יותר.
            <br />
            קבצים נתמכים: JPG, PNG, WEBP · עד 3MB לקובץ
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFileSelect(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={attachments.length >= 3}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-4 py-2.5 text-xs font-black text-[#0F172A] transition-colors hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            צירוף תמונה
          </button>

          {attachmentError && <p className="mt-2 text-[11px] font-bold text-rose-600">{attachmentError}</p>}
          {attachments.length > 0 && (
            <div className="mt-3">
              <PendingAttachmentTray
                attachments={attachments}
                onRemove={(index) => setAttachments((current) => current.filter((_, i) => i !== index))}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[#E2E8F0] pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all hover:from-blue-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {submitting ? "שולח..." : "שליחת הפנייה"}
          </button>
        </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <div className="rounded-[20px] border border-blue-100 bg-blue-50/70 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-sm font-black text-blue-950">כך נקצר את זמן הטיפול</h2>
            <p className="mt-1 text-xs font-semibold leading-6 text-blue-900/70">
              ככל שתוסיף יותר פרטים וצילומי מסך, נוכל לטפל בפנייה מהר יותר.
            </p>
            <ol className="mt-4 space-y-2 text-[11px] font-bold leading-5 text-blue-900/75">
              <li className="flex gap-2"><span className="text-blue-600">01</span><span>תאר מה ניסית לבצע ומה קרה בפועל.</span></li>
              <li className="flex gap-2"><span className="text-blue-600">02</span><span>ציין מתי התקלה התחילה והאם היא חוזרת.</span></li>
              <li className="flex gap-2"><span className="text-blue-600">03</span><span>צרף צילום ללא סיסמאות או מידע רגיש.</span></li>
            </ol>
          </div>

          <div className="flex items-start gap-3 rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <p className="text-[11px] font-semibold leading-5 text-emerald-900/75">
              הפנייה נשמרת בחשבון שלך. רק אתה וצוות התמיכה המורשה יכולים לצפות בתוכן שלה.
            </p>
          </div>
        </aside>
      </form>
    </CustomerPortalPageShell>
  );
}
