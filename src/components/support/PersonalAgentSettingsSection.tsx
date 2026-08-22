"use client";

import { useRef, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
  BellRing,
  BriefcaseBusiness,
  Camera,
  Check,
  Clock3,
  ImagePlus,
  Languages,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { updateMySupportProfile } from "@/lib/actions/support-profile-actions";
import {
  SUPPORT_LANGUAGE_OPTIONS,
  type SupportAgentProfile,
  type SupportAgentProfileInput,
} from "@/lib/support-profile";
import type { AgentStatus } from "@/lib/support-types";
import PremiumAnimatedBorder from "./PremiumAnimatedBorder";
import SupportAgentAvatar from "./SupportAgentAvatar";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 512;
const MAX_STORED_IMAGE_DATA_URL_LENGTH = 700_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const FIELD_CLASS =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-900 outline-none transition-[border,box-shadow,background] placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

type EditableProfile = Omit<
  SupportAgentProfileInput,
  "removeProfileImage" | "profileImageDataUrl"
>;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("INVALID_IMAGE_RESULT"));
    reader.onerror = () => reject(new Error("IMAGE_READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("IMAGE_DECODE_FAILED"));
    image.src = dataUrl;
  });
}

async function prepareProfileImage(file: File) {
  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("CANVAS_UNAVAILABLE");
  context.drawImage(image, 0, 0, width, height);

  for (const quality of [0.86, 0.74, 0.62]) {
    const dataUrl = canvas.toDataURL("image/webp", quality);
    if (dataUrl.startsWith("data:image/webp") && dataUrl.length <= MAX_STORED_IMAGE_DATA_URL_LENGTH) {
      return dataUrl;
    }
  }

  const fallback = canvas.toDataURL("image/jpeg", 0.72);
  if (fallback.length <= MAX_STORED_IMAGE_DATA_URL_LENGTH) return fallback;
  throw new Error("IMAGE_STILL_TOO_LARGE");
}

function editableProfile(profile: SupportAgentProfile): EditableProfile {
  return {
    name: profile.name,
    displayName: profile.displayName,
    phone: profile.phone,
    department: profile.department,
    specialty: profile.specialty,
    supportLanguages: profile.supportLanguages,
    openingMessage: profile.openingMessage,
    detailsRequest: profile.detailsRequest,
    waitingMessage: profile.waitingMessage,
    closingMessage: profile.closingMessage,
    maxActiveChats: profile.maxActiveChats,
    defaultAvailabilityStatus: profile.defaultAvailabilityStatus,
    autoAwayMinutes: profile.autoAwayMinutes,
    newRequestNotifications: profile.newRequestNotifications,
  };
}

export default function PersonalAgentSettingsSection({
  profile,
  currentStatus,
  onProfileUpdated,
}: {
  profile: SupportAgentProfile;
  currentStatus: AgentStatus;
  onProfileUpdated: (profile: SupportAgentProfile) => void;
}) {
  const { update: updateSession } = useSession();
  const [savedProfile, setSavedProfile] = useState(profile);
  const [form, setForm] = useState<EditableProfile>(() => editableProfile(profile));
  const [pendingImageDataUrl, setPendingImageDataUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(editableProfile(savedProfile)) ||
    removeProfileImage ||
    Boolean(pendingImageDataUrl);
  const visibleImage =
    pendingImageDataUrl || (removeProfileImage ? null : savedProfile.profileImageUrl);
  const publicName = form.displayName || form.name || "נציג/ת תמיכה";

  function setField<K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice(null);
  }

  function resetForm() {
    setForm(editableProfile(savedProfile));
    setRemoveProfileImage(false);
    setPendingImageDataUrl(null);
    setPreviewFileName(null);
    setImageError(null);
    setNotice(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function selectImage(file: File | undefined) {
    setImageError(null);
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setImageError("סוג הקובץ אינו נתמך. ניתן להעלות PNG, JPG או WEBP בלבד.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("הקובץ גדול מדי. ניתן להעלות תמונה עד 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImageProcessing(true);
    try {
      const dataUrl = await prepareProfileImage(file);
      setPendingImageDataUrl(dataUrl);
      setPreviewFileName(file.name);
      setRemoveProfileImage(false);
      setNotice(null);
    } catch {
      setImageError("לא ניתן לעבד את התמונה. נסה קובץ אחר או תמונה קטנה יותר.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setImageProcessing(false);
    }
  }

  function removeImage() {
    if (pendingImageDataUrl) {
      setPendingImageDataUrl(null);
      setPreviewFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (savedProfile.profileImageUrl) {
      setRemoveProfileImage(true);
      setImageError(null);
    }
  }

  function toggleLanguage(language: string) {
    setField(
      "supportLanguages",
      form.supportLanguages.includes(language)
        ? form.supportLanguages.filter((item) => item !== language)
        : [...form.supportLanguages, language],
    );
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    if (imageProcessing) {
      setImageError("המתן לסיום עיבוד התמונה לפני השמירה.");
      return;
    }
    setSaving(true);
    let result: Awaited<ReturnType<typeof updateMySupportProfile>>;
    try {
      result = await updateMySupportProfile({
        ...form,
        removeProfileImage,
        profileImageDataUrl: pendingImageDataUrl,
      });
    } catch {
      setNotice({ tone: "error", text: "השמירה נכשלה עקב בעיית תקשורת. נסה שוב." });
      setSaving(false);
      return;
    }
    setSaving(false);

    if (!result.ok) {
      setNotice({ tone: "error", text: result.error });
      return;
    }

    setSavedProfile(result.data);
    setForm(editableProfile(result.data));
    setRemoveProfileImage(false);
    setPendingImageDataUrl(null);
    setPreviewFileName(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setNotice({ tone: "success", text: "הפרטים נשמרו בהצלחה" });
    onProfileUpdated(result.data);
    await updateSession({ name: result.data.displayName || result.data.name }).catch(() => undefined);
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <PremiumAnimatedBorder className="rounded-[24px] p-px shadow-[0_18px_48px_-38px_rgba(15,23,42,0.65)]">
      <section className="overflow-hidden rounded-[23px] bg-white">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-black tracking-[-0.02em] text-slate-950 sm:text-2xl">הגדרות אישיות</h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">
                הפרופיל שלי
              </span>
              {isDirty && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  שינויים שלא נשמרו
                </span>
              )}
            </div>
            <p className="mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              ניהול הזהות המקצועית, העדפות הזמינות והתגובות האישיות שמלוות אותך בשיחות תמיכה.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={!isDirty || saving}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              ביטול
            </button>
            <button
              type="submit"
              disabled={!isDirty || saving || imageProcessing}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.8)] outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              {saving ? "שומר..." : "שמירת שינויים"}
            </button>
          </div>
        </div>
      </section>
      </PremiumAnimatedBorder>

      {notice && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-xs font-bold ${
            notice.tone === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-800"
              : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <div className="space-y-5">
          <SettingsCard icon={UserRound} title="פרטים אישיים" description="הפרטים שמזהים אותך בתוך סביבת התמיכה.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="שם מלא" required>
                <input value={form.name} onChange={(event) => setField("name", event.target.value)} maxLength={80} className={FIELD_CLASS} />
              </Field>
              <Field label="שם תצוגה" hint="מוצג ללקוחות ולחברי הצוות" required>
                <input value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} maxLength={60} className={FIELD_CLASS} />
              </Field>
              <Field label="אימייל" hint="משמש להתחברות ולכן אינו ניתן לעריכה כאן">
                <input value={savedProfile.email} readOnly disabled className={FIELD_CLASS} />
              </Field>
              <Field label="טלפון">
                <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} maxLength={30} inputMode="tel" className={FIELD_CLASS} />
              </Field>
              <Field label="תפקיד" hint="ניתן לשינוי על ידי מנהל מערכת בלבד">
                <input value={savedProfile.roleLabel} readOnly disabled className={FIELD_CLASS} />
              </Field>
              <Field label="מחלקה / צוות">
                <input value={form.department} onChange={(event) => setField("department", event.target.value)} maxLength={80} placeholder="לדוגמה: תמיכה טכנית" className={FIELD_CLASS} />
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard icon={BriefcaseBusiness} title="פרטי תמיכה" description="הקשר מקצועי שעוזר לצוות להפנות אליך פניות מתאימות.">
            <div className="space-y-4">
              <Field label="תחום התמחות">
                <input value={form.specialty} onChange={(event) => setField("specialty", event.target.value)} maxLength={120} placeholder="לדוגמה: Microsoft 365, רשתות ו־VPN" className={FIELD_CLASS} />
              </Field>
              <div>
                <p className="mb-2 text-xs font-black text-slate-800">שפות שירות</p>
                <div role="group" aria-label="שפות שירות" className="flex flex-wrap gap-2 pt-1">
                  {SUPPORT_LANGUAGE_OPTIONS.map((language) => {
                    const selected = form.supportLanguages.includes(language);
                    return (
                      <button
                        key={language}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleLanguage(language)}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-black outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          selected
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Languages className="h-3.5 w-3.5" aria-hidden="true" />}
                        {language}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[10px] font-semibold leading-4 text-slate-400">
                  בחר את השפות שבהן ניתן לנהל שיחת תמיכה
                </p>
              </div>
            </div>
          </SettingsCard>
        </div>

        <div className="space-y-5">
          <SettingsCard icon={Camera} title="תמונת פרופיל" description="מופיעה בכרטיס הנציג ובשיחות עם לקוחות.">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <SupportAgentAvatar name={publicName} imageUrl={visibleImage} className="h-24 w-24 ring-4 ring-slate-50" textClassName="text-2xl" />
                <span className="absolute -bottom-1 -left-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-sm font-black text-slate-900">{publicName}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{savedProfile.roleLabel}</p>
              {previewFileName && <p className="mt-2 max-w-full truncate text-[10px] font-bold text-blue-700">מוכן לשמירה: {previewFileName}</p>}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => void selectImage(event.target.files?.[0])}
              />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageProcessing || saving}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-50 px-3 text-[11px] font-black text-blue-700 outline-none transition-colors hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60"
                >
                  <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                  {imageProcessing ? "מעבד תמונה..." : "העלאת תמונה"}
                </button>
                {visibleImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-600 outline-none transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    הסרת תמונה
                  </button>
                )}
              </div>
              <p className="mt-3 text-[10px] font-semibold leading-4 text-slate-400">PNG, JPG או WEBP · עד 2MB</p>
              <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-bold leading-4 text-emerald-800">
                התמונה מותאמת אוטומטית ונשמרת בפרופיל לאחר לחיצה על שמירת שינויים.
              </p>
              {imageError && <p role="alert" className="mt-2 text-[11px] font-bold leading-5 text-rose-600">{imageError}</p>}
            </div>
          </SettingsCard>

          <SettingsCard icon={Clock3} title="העדפות זמינות" description="ברירות המחדל לפתיחת משמרת וקבלת פניות.">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-slate-500">סטטוס נוכחי</span>
                  <StatusPill status={currentStatus} />
                </div>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">את הסטטוס הנוכחי משנים מראש סביבת העבודה.</p>
              </div>
              <Field label="סטטוס ברירת מחדל">
                <select value={form.defaultAvailabilityStatus} onChange={(event) => setField("defaultAvailabilityStatus", event.target.value as AgentStatus)} className={FIELD_CLASS}>
                  <option value="AVAILABLE">זמין</option>
                  <option value="BUSY">עסוק</option>
                  <option value="OFFLINE">לא זמין</option>
                </select>
              </Field>
              <Field label="מספר שיחות פעילות מקסימלי">
                <input type="number" min={1} max={10} value={form.maxActiveChats} onChange={(event) => setField("maxActiveChats", Number(event.target.value))} className={FIELD_CLASS} />
              </Field>
              <Field label="מעבר אוטומטי ללא זמין">
                <select value={form.autoAwayMinutes ?? 0} onChange={(event) => setField("autoAwayMinutes", Number(event.target.value) || null)} className={FIELD_CLASS}>
                  <option value={0}>ללא מעבר אוטומטי</option>
                  <option value={5}>אחרי 5 דקות</option>
                  <option value={15}>אחרי 15 דקות</option>
                  <option value={30}>אחרי 30 דקות</option>
                  <option value={60}>אחרי שעה</option>
                </select>
              </Field>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                <span>
                  <span className="flex items-center gap-2 text-xs font-black text-slate-800">
                    <BellRing className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                    התראות על בקשות חדשות
                  </span>
                  <span className="mt-1 block text-[10px] font-semibold text-slate-400">קבלת התראה כאשר פנייה חדשה נכנסת לתור.</span>
                </span>
                <input
                  type="checkbox"
                  checked={form.newRequestNotifications}
                  onChange={(event) => setField("newRequestNotifications", event.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
              </label>
            </div>
          </SettingsCard>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 rounded-[20px] border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          האימייל והתפקיד מוגנים ואינם ניתנים לשינוי באזור האישי.
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={resetForm} disabled={!isDirty || saving} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-45">ביטול</button>
          <button type="submit" disabled={!isDirty || saving || imageProcessing} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-black text-white outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300">
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            {saving ? "שומר..." : "שמירת שינויים"}
          </button>
        </div>
      </div>
    </form>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_36px_-32px_rgba(15,23,42,0.65)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-blue-50 text-blue-700">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  required = false,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-slate-800">
        <span>
          {label}
          {required && <span className="mr-1 text-rose-500">*</span>}
        </span>
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[10px] font-semibold leading-4 text-slate-400">{hint}</span>}
    </label>
  );
}

function StatusPill({ status }: { status: AgentStatus }) {
  const meta = {
    AVAILABLE: { label: "זמין", className: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    BUSY: { label: "עסוק", className: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    OFFLINE: { label: "לא זמין", className: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-extrabold ${meta.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
