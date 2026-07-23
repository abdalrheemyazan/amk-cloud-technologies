import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import CustomerPortalRoute from "@/components/portal/CustomerPortalRoute";
import type { CustomerSectionKey } from "@/lib/customer-portal-sections";
import { isPolicyDocumentKey, POLICY_DOCUMENTS } from "@/lib/policy-documents";

const PORTAL_SECTIONS: Record<string, { key: CustomerSectionKey; title: string; description: string }> = {
  services: { key: "services", title: "השירותים שלי", description: "שירותי הענן והתמיכה בחשבון AMK שלך." },
  "new-request": { key: "new-request", title: "פתיחת פנייה", description: "פתיחת פנייה חדשה לצוות התמיכה של AMK." },
  requests: { key: "requests", title: "הפניות שלי", description: "מעקב אחר פניות התמיכה בחשבון AMK שלך." },
  chat: { key: "chat", title: "צ׳אט תמיכה", description: "שיחה עם העוזר החכם וצוות התמיכה של AMK." },
  documents: { key: "documents", title: "מסמכים וקבצים", description: "מסמכי השירות והקבצים בחשבון AMK שלך." },
  updates: { key: "updates", title: "הודעות ועדכונים", description: "הודעות שירות ועדכונים חשובים לחשבון AMK שלך." },
  settings: { key: "settings", title: "הגדרות אישיות", description: "ניהול פרטי החשבון והעדפות השירות שלך." },
  contact: { key: "contact", title: "צור קשר עם AMK", description: "יצירת קשר עם AMK מתוך אזור הלקוח." },
};

// Policy documents used to be their own full-page routes (/portal/privacy, /portal/terms, ...).
// They now live as instant client-side tabs inside /portal/documents, so old links/bookmarks
// redirect there before any portal data is fetched.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  if (isPolicyDocumentKey(section)) {
    const policy = POLICY_DOCUMENTS[section];
    return { title: `${policy.title} | אזור הלקוח של AMK`, description: policy.description };
  }

  const config = PORTAL_SECTIONS[section];
  if (!config) return {};

  return {
    title: `${config.title} | אזור הלקוח של AMK`,
    description: config.description,
  };
}

export default async function CustomerPortalSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ section }, query] = await Promise.all([params, searchParams]);

  if (isPolicyDocumentKey(section)) {
    redirect(POLICY_DOCUMENTS[section].portalHref);
  }

  const config = PORTAL_SECTIONS[section];

  if (!config) {
    notFound();
  }

  return <CustomerPortalRoute activeSection={config.key} query={query} />;
}
