"use client";

import { useState } from "react";
import { Bell, Check, RotateCcw, Save, ShieldCheck } from "lucide-react";
import {
  updateMyCustomerProfile,
  type CustomerProfile,
  type CustomerProfileInput,
} from "@/lib/actions/customer-profile-actions";
import CustomerProfileImageUpload from "./CustomerProfileImageUpload";
import CustomerCompanyDetailsForm from "./CustomerCompanyDetailsForm";

const FIELD_CLASS =
  "h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-3.5 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-blue-500 focus:bg-white";

const LANGUAGE_OPTIONS = [
  { value: "he", label: "עברית" },
  { value: "en", label: "English" },
];

type EditableFields = Omit<CustomerProfileInput, "profileImageDataUrl" | "removeProfileImage">;

const NOTIFICATION_TOGGLES: { key: keyof EditableFields; label: string }[] = [
  { key: "notifyEmailUpdates", label: "קבלת עדכונים במייל" },
  { key: "notifyRequestUpdates", label: "קבלת עדכונים על פניות" },
  { key: "notifyMaintenanceAlerts", label: "קבלת הודעות תחזוקה" },
  { key: "notifyDocumentUpdates", label: "קבלת עדכוני מסמכים" },
];

function editableFromProfile(profile: CustomerProfile): EditableFields {
  return {
    name: profile.name,
    displayName: profile.displayName,
    phone: profile.phone,
    preferredLanguage: profile.preferredLanguage,
    companyName: profile.companyName,
    companyIdNumber: profile.companyIdNumber,
    companyRole: profile.companyRole,
    companyAddress: profile.companyAddress,
    companyPhone: profile.companyPhone,
    technicalContact: profile.technicalContact,
    technicalEmail: profile.technicalEmail,
    businessField: profile.businessField,
    employeeCount: profile.employeeCount,
    serviceNotes: profile.serviceNotes,
    notifyEmailUpdates: profile.notifyEmailUpdates,
    notifyRequestUpdates: profile.notifyRequestUpdates,
    notifyMaintenanceAlerts: profile.notifyMaintenanceAlerts,
    notifyDocumentUpdates: profile.notifyDocumentUpdates,
  };
}

export default function CustomerProfileSettingsSection({
  initialProfile,
  onProfileUpdated,
}: {
  initialProfile: CustomerProfile;
  onProfileUpdated: (profile: CustomerProfile) => void;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [fields, setFields] = useState<EditableFields>(editableFromProfile(initialProfile));
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function updateField<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setFields(editableFromProfile(profile));
    setPendingImage(null);
    setImageRemoved(false);
    setImageError(null);
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setNotice(null);
    setImageError(null);

    if (!fields.name.trim()) {
      setNotice({ tone: "error", text: "יש למלא שם מלא." });
      return;
    }

    setSaving(true);
    const input: CustomerProfileInput = {
      ...fields,
      profileImageDataUrl: pendingImage || undefined,
      removeProfileImage: imageRemoved,
    };
    const result = await updateMyCustomerProfile(input);
    setSaving(false);

    if (!result.ok) {
      setNotice({ tone: "error", text: result.error });
      return;
    }

    setProfile(result.data);
    setFields(editableFromProfile(result.data));
    setPendingImage(null);
    setImageRemoved(false);
    onProfileUpdated(result.data);
    setNotice({ tone: "success", text: "הפרטים נשמרו בהצלחה" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-end gap-2 rounded-[16px] border border-slate-200 bg-white px-3 py-2.5">
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-black text-[#0F172A] outline-none transition-colors hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            ביטול
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-indigo-600 px-4 text-xs font-black text-white shadow-sm outline-none transition-all hover:from-blue-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            {saving ? "שומר..." : "שמירת שינויים"}
          </button>
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-xl px-3.5 py-3 text-xs font-bold ${
            notice.tone === "success" ? "border border-emerald-100 bg-emerald-50 text-emerald-800" : "border border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <p className="mb-4 text-sm font-black text-[#0F172A]">תמונת פרופיל</p>
        <CustomerProfileImageUpload
          userName={fields.displayName || fields.name}
          currentImageUrl={profile.profileImageUrl}
          pendingDataUrl={pendingImage}
          removed={imageRemoved}
          onSelect={(dataUrl) => {
            setPendingImage(dataUrl);
            setImageRemoved(false);
            setImageError(null);
          }}
          onRemove={() => {
            setPendingImage(null);
            setImageRemoved(true);
            setImageError(null);
          }}
          onValidationError={(message) => setImageError(message)}
          error={imageError}
        />
      </section>

      <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <p className="mb-4 text-sm font-black text-[#0F172A]">פרטים אישיים</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-black text-[#0F172A]">שם מלא*</label>
            <input
              value={fields.name}
              onChange={(e) => updateField("name", e.target.value)}
              maxLength={80}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-[#0F172A]">שם תצוגה</label>
            <input
              value={fields.displayName}
              onChange={(e) => updateField("displayName", e.target.value)}
              maxLength={60}
              placeholder={fields.name}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-[#0F172A]">אימייל</label>
            <input value={profile.email} disabled dir="ltr" className={`${FIELD_CLASS} cursor-not-allowed opacity-70`} />
            <p className="mt-1 text-[10px] font-semibold text-[#94A3B8]">משמש להתחברות ולכן אינו ניתן לעריכה כאן.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-[#0F172A]">טלפון</label>
            <input
              value={fields.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              maxLength={30}
              dir="ltr"
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-[#0F172A]">שפה מועדפת</label>
            <select
              value={fields.preferredLanguage}
              onChange={(e) => updateField("preferredLanguage", e.target.value)}
              className={FIELD_CLASS}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <p className="mb-1 text-sm font-black text-[#0F172A]">פרטי חברה</p>
        <p className="mb-4 text-xs font-semibold text-[#94A3B8]">אופציונלי — עוזר לנו לתת שירות מותאם יותר לחברה שלך.</p>
        <CustomerCompanyDetailsForm values={fields} onChange={updateField} />
      </section>

      <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 text-blue-600">
            <Bell className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm font-black text-[#0F172A]">העדפות התראות</p>
        </div>
        <div className="space-y-2">
          {NOTIFICATION_TOGGLES.map((toggle) => {
            const active = Boolean(fields[toggle.key]);
            return (
              <button
                key={toggle.key}
                type="button"
                onClick={() => updateField(toggle.key, !active as EditableFields[typeof toggle.key])}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition-colors ${
                  active ? "border-blue-200 bg-blue-50/70 text-blue-800" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F4F7FB]"
                }`}
              >
                <span>{toggle.label}</span>
                <span
                  className={`me-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3 text-[11px] font-semibold leading-relaxed text-blue-800">
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
        האימייל משמש להתחברות ומוגן מפני שינוי מכאן.
      </div>
    </form>
  );
}
