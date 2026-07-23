"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, UserRoundCog } from "lucide-react";
import { useCallback, useState } from "react";
import { getMyPortalSummary } from "@/lib/actions/support-chat-actions";
import type { CustomerProfile } from "@/lib/customer-profile-data";
import type { CustomerPortalInitialData } from "@/lib/customer-portal-data";
import type { CustomerSectionKey } from "@/lib/customer-portal-sections";
import type { PolicyDocumentKey } from "@/lib/policy-documents";
import CustomerPortalShell from "./CustomerPortalShell";
import CustomerPortalHero from "./CustomerPortalHero";
import CustomerQuickActions from "./CustomerQuickActions";
import CustomerOverviewCards from "./CustomerOverviewCards";
import CustomerServicesGrid from "./CustomerServicesGrid";
import CustomerRequestsList from "./CustomerRequestsList";
import type { ChatSeed } from "./CustomerSupportChatPanel";
import CustomerSmartChatCard from "./CustomerSmartChatCard";
import CustomerUpdatesSection from "./CustomerUpdatesSection";
import CustomerDocumentsSection from "./CustomerDocumentsSection";
import CustomerPortalPageShell from "./CustomerPortalPageShell";
import CustomerContactSection from "./CustomerContactSection";

function SectionSkeleton({ minHeight = 320 }: { minHeight?: number }) {
  return (
    <div
      className="animate-pulse rounded-[20px] border border-slate-200 bg-white p-5"
      style={{ minHeight }}
      aria-hidden="true"
    >
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-64 max-w-full rounded bg-slate-100" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-2xl bg-slate-100" />
        <div className="h-28 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

const CustomerNewRequestForm = dynamic(() => import("./CustomerNewRequestForm"), {
  loading: () => <SectionSkeleton />,
});
const CustomerSupportChatPanel = dynamic(() => import("./CustomerSupportChatPanel"), {
  loading: () => <SectionSkeleton minHeight={560} />,
});
const CustomerProfileSettingsSection = dynamic(() => import("./CustomerProfileSettingsSection"), {
  loading: () => <SectionSkeleton minHeight={520} />,
});
const CustomerRequestsSection = dynamic(() => import("./CustomerRequestsSection"), {
  loading: () => <SectionSkeleton />,
});

export default function CustomerPortalHome({
  activeSection,
  initialData,
  initialChatSeed = null,
  initialPolicyKey = null,
}: {
  activeSection: CustomerSectionKey;
  initialData: CustomerPortalInitialData;
  initialChatSeed?: ChatSeed | null;
  initialPolicyKey?: PolicyDocumentKey | null;
}) {
  const router = useRouter();
  const [openRequestsCount, setOpenRequestsCount] = useState(initialData.openRequestsCount);
  const [recentRequests, setRecentRequests] = useState(initialData.recentRequests);
  const [supportAvailable, setSupportAvailable] = useState(initialData.supportAvailable);
  const [profile, setProfile] = useState<CustomerProfile | null>(initialData.profile);

  const refresh = useCallback(async () => {
    const result = await getMyPortalSummary();
    if (result.ok) {
      setOpenRequestsCount(result.data.openRequestsCount);
      setRecentRequests(result.data.recentRequests);
      setSupportAvailable(result.data.supportAvailable);
    }
  }, []);

  function goToNewRequest() {
    router.push("/portal/new-request");
  }

  function goToChat() {
    router.push("/portal/chat");
  }

  function goToServices() {
    router.push("/portal/services");
  }

  function openRequest(sessionId: string) {
    router.push(`/portal/chat?request=${encodeURIComponent(sessionId)}`);
  }

  const displayName = profile?.displayName || initialData.displayName;
  const profileImageUrl = profile?.profileImageUrl ?? initialData.profileImageUrl;

  return (
    <CustomerPortalShell
      userName={displayName}
      userImage={profileImageUrl}
      activeSection={activeSection}
      badges={{ requests: openRequestsCount || undefined }}
    >
      <div key={activeSection} className="support-section-in">
      {activeSection === "overview" && (
        <div className="space-y-6">
          <CustomerPortalHero
            customerName={displayName}
            supportAvailable={supportAvailable}
            onNewRequest={goToNewRequest}
            onOpenChat={goToChat}
          />

          <CustomerQuickActions onNewRequest={goToNewRequest} onOpenChat={goToChat} onOpenServices={goToServices} />

          <CustomerOverviewCards loaded openRequestsCount={openRequestsCount} />

          <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-[#0F172A]">פעילות אחרונה</p>
              <Link
                href="/portal/requests"
                className="text-xs font-black text-blue-600 transition-colors hover:text-blue-700"
              >
                כל הפניות
              </Link>
            </div>
            <CustomerRequestsList
              requests={recentRequests}
              loaded
              onOpenRequest={openRequest}
              onCancelled={refresh}
              limit={3}
            />
          </section>

          <CustomerSmartChatCard onOpenChat={goToChat} />
        </div>
      )}

      {activeSection === "services" && <CustomerServicesGrid />}

      {activeSection === "new-request" && (
        <CustomerNewRequestForm
          onSubmitted={() => {
            void refresh();
            router.push("/portal/requests");
          }}
        />
      )}

      {activeSection === "requests" && (
        <CustomerRequestsSection
          requests={recentRequests}
          loaded
          onOpenRequest={openRequest}
          onCancelled={refresh}
        />
      )}

      {activeSection === "chat" && (
        <CustomerPortalPageShell
          title="צ׳אט תמיכה חכם"
          description="שוחח עם העוזר החכם של AMK ובמידת הצורך נעביר אותך לנציג אנושי."
          eyebrow="ערוץ תמיכה חי"
          icon={MessageCircle}
          tone="emerald"
          badge={supportAvailable ? "נציגים זמינים" : "הפנייה נשמרת בתור"}
        >
          <CustomerSupportChatPanel
            seed={initialChatSeed}
            onSeedConsumed={() => {
              if (initialChatSeed) router.replace("/portal/chat");
            }}
          />
        </CustomerPortalPageShell>
      )}

      {activeSection === "documents" && <CustomerDocumentsSection initialPolicyKey={initialPolicyKey} />}
      {activeSection === "updates" && <CustomerUpdatesSection />}
      {activeSection === "settings" && (
        <CustomerPortalPageShell
          title="הגדרות אישיות"
          description="נהל את פרטי החשבון, החברה והעדפות השירות שלך."
          eyebrow="פרופיל וחשבון"
          icon={UserRoundCog}
          tone="slate"
          badge={profile ? "חשבון מאובטח" : undefined}
        >
          {profile ? (
            <CustomerProfileSettingsSection initialProfile={profile} onProfileUpdated={setProfile} />
          ) : (
            <div className="rounded-[20px] border border-slate-200 bg-white py-12 text-center text-xs font-semibold text-slate-400">
              טוען את ההגדרות שלך...
            </div>
          )}
        </CustomerPortalPageShell>
      )}

      {activeSection === "contact" && <CustomerContactSection />}
      </div>
    </CustomerPortalShell>
  );
}
