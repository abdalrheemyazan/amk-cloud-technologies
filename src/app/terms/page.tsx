// This page contains general template text and must be reviewed by a qualified Israeli lawyer before production launch.

import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import PolicyDocumentContent from "@/components/legal/PolicyDocumentContent";
import { resolveLegalPageContext } from "@/lib/legal-page-context";
import { POLICY_DOCUMENTS } from "@/lib/policy-documents";

export const metadata: Metadata = {
  title: "תנאי שימוש | AMK Cloud Technologies",
  description: "תנאי השימוש באתר ובמערכת התמיכה של AMK Cloud Technologies.",
};

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ from?: string | string[] }> }) {
  const context = resolveLegalPageContext((await searchParams).from);
  const policy = POLICY_DOCUMENTS.terms;

  return (
    <LegalPageLayout
      title={policy.title}
      description={policy.description}
      tocItems={policy.toc}
      tone={policy.tone}
      context={context}
      updatedAt={policy.updatedAt}
      portalHref={policy.portalHref}
    >
      <PolicyDocumentContent policyKey={policy.key} />
    </LegalPageLayout>
  );
}
