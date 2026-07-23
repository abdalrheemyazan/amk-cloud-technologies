"use client";

import type { CustomerProfileInput } from "@/lib/actions/customer-profile-actions";

const FIELD_CLASS =
  "h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-3.5 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-blue-500 focus:bg-white";

type CompanyFields = Pick<
  CustomerProfileInput,
  | "companyName"
  | "companyIdNumber"
  | "companyRole"
  | "companyAddress"
  | "companyPhone"
  | "technicalContact"
  | "technicalEmail"
  | "businessField"
  | "employeeCount"
  | "serviceNotes"
>;

export default function CustomerCompanyDetailsForm({
  values,
  onChange,
}: {
  values: CompanyFields;
  onChange: <K extends keyof CompanyFields>(field: K, value: CompanyFields[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="שם חברה" value={values.companyName} onChange={(v) => onChange("companyName", v)} maxLength={120} />
        <Field
          label="מספר חברה / עוסק מורשה"
          value={values.companyIdNumber}
          onChange={(v) => onChange("companyIdNumber", v)}
          maxLength={40}
        />
        <Field label="תפקיד בחברה" value={values.companyRole} onChange={(v) => onChange("companyRole", v)} maxLength={80} />
        <Field label="טלפון חברה" value={values.companyPhone} onChange={(v) => onChange("companyPhone", v)} maxLength={30} dir="ltr" />
        <Field
          label="איש קשר טכני"
          value={values.technicalContact}
          onChange={(v) => onChange("technicalContact", v)}
          maxLength={80}
        />
        <Field
          label="אימייל איש קשר טכני"
          value={values.technicalEmail}
          onChange={(v) => onChange("technicalEmail", v)}
          maxLength={120}
          dir="ltr"
          type="email"
        />
        <Field label="תחום פעילות" value={values.businessField} onChange={(v) => onChange("businessField", v)} maxLength={80} />
        <Field label="מספר עובדים" value={values.employeeCount} onChange={(v) => onChange("employeeCount", v)} maxLength={20} />
      </div>

      <Field
        label="כתובת חברה"
        value={values.companyAddress}
        onChange={(v) => onChange("companyAddress", v)}
        maxLength={200}
      />

      <div>
        <label className="mb-1.5 block text-xs font-black text-[#0F172A]">הערות שירות</label>
        <textarea
          value={values.serviceNotes}
          onChange={(e) => onChange("serviceNotes", e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="הערות רלוונטיות לצוות התמיכה — שעות פעילות, אנשי קשר נוספים וכדומה."
          className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-3.5 py-2.5 text-sm leading-relaxed text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-blue-500 focus:bg-white"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  maxLength,
  dir,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  dir?: "ltr" | "rtl";
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-[#0F172A]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        dir={dir}
        className={FIELD_CLASS}
      />
    </div>
  );
}
