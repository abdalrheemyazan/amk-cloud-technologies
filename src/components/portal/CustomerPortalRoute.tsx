import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-session";
import { loadCustomerPortalData } from "@/lib/customer-portal-data";
import { isStaffRole } from "@/lib/roles";
import type { CustomerSectionKey } from "@/lib/customer-portal-sections";
import { isPolicyDocumentKey, type PolicyDocumentKey } from "@/lib/policy-documents";
import type { ChatSeed } from "./CustomerSupportChatPanel";
import CustomerPortalHome from "./CustomerPortalHome";
import { devTimed } from "@/lib/dev-perf";

function firstString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CustomerPortalRoute({
  activeSection,
  query = {},
}: {
  activeSection: CustomerSectionKey;
  query?: Record<string, string | string[] | undefined>;
}) {
  const session = await getPortalSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (isStaffRole(session.user.role)) {
    redirect("/support/agent");
  }

  const initialData = await devTimed(`route:${activeSection} total`, () => loadCustomerPortalData(session.user.id as string, activeSection));

  let initialChatSeed: ChatSeed | null = null;
  if (activeSection === "chat") {
    const requestId = firstString(query.request)?.trim();
    const action = firstString(query.action);

    if (requestId && requestId.length <= 100) {
      initialChatSeed = { type: "view", sessionId: requestId };
    } else if (action === "request-agent") {
      initialChatSeed = { type: "request-agent" };
    }
  }

  let initialPolicyKey: PolicyDocumentKey | null = null;
  if (activeSection === "documents") {
    const policyParam = firstString(query.policy)?.trim();
    if (isPolicyDocumentKey(policyParam)) initialPolicyKey = policyParam;
  }

  return (
    <CustomerPortalHome
      activeSection={activeSection}
      initialChatSeed={initialChatSeed}
      initialData={initialData}
      initialPolicyKey={initialPolicyKey}
    />
  );
}
