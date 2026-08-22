// This page contains general template text and must be reviewed by a qualified Israeli lawyer before production launch.

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Mail, PhoneCall, Clock } from "lucide-react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import ContactForm from "@/components/legal/ContactForm";
import { authOptions } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";

import { SUPPORT_CONTACT_CONFIG } from "@/lib/contact-config";

export const metadata: Metadata = {
  title: "צור קשר | AMK Cloud Technologies",
  description: "יצירת קשר עם AMK Cloud Technologies.",
};

export default async function ContactPage() {
  const session = await getServerSession(authOptions);

  if (session?.user && !isStaffRole(session.user.role)) {
    redirect("/portal/contact");
  }

  return (
    <LegalPageLayout
      title="צור קשר"
      description="נשמח לסייע בכל שאלה, בקשת שירות או פנייה בנושא תמיכה טכנית."
      tone="contact"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <ContactForm />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-[#F4F7FB] border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
            <p className="font-black text-sm text-[#0F172A]">AMK Cloud Technologies</p>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] text-[#94A3B8] font-bold">אימייל</div>
                <a
                  href={`mailto:${SUPPORT_CONTACT_CONFIG.email}`}
                  className="text-sm text-[#0F172A] font-semibold hover:text-blue-600 transition-colors"
                  dir="ltr"
                >
                  {SUPPORT_CONTACT_CONFIG.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] text-[#94A3B8] font-bold">טלפון</div>
                <a
                  href={`tel:${SUPPORT_CONTACT_CONFIG.phoneE164}`}
                  className="text-sm text-[#0F172A] font-semibold hover:text-blue-600 transition-colors"
                  dir="ltr"
                >
                  {SUPPORT_CONTACT_CONFIG.phoneDisplay}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] text-[#94A3B8] font-bold">שעות פעילות</div>
                <div className="text-sm text-[#0F172A] font-semibold">{SUPPORT_CONTACT_CONFIG.workingHours}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}
