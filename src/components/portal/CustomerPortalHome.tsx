"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  Inbox,
  Server,
  Shield,
  UserRoundCog,
} from "lucide-react";
import { useCallback, useState } from "react";
import { getMyPortalSummary } from "@/lib/actions/support-chat-actions";
import type { CustomerProfile } from "@/lib/customer-profile-data";
import type { CustomerPortalInitialData } from "@/lib/customer-portal-data";
import type { CustomerSectionKey } from "@/lib/customer-portal-sections";
import type { PolicyDocumentKey } from "@/lib/policy-documents";
import CustomerPortalHero from "./CustomerPortalHero";
import CustomerQuickActions from "./CustomerQuickActions";
import CustomerOverviewCards from "./CustomerOverviewCards";
import CustomerServicesGrid from "./CustomerServicesGrid";
import CustomerRequestsList from "./CustomerRequestsList";
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
const CustomerProfileSettingsSection = dynamic(() => import("./CustomerProfileSettingsSection"), {
  loading: () => <SectionSkeleton minHeight={520} />,
});
const CustomerRequestsSection = dynamic(() => import("./CustomerRequestsSection"), {
  loading: () => <SectionSkeleton />,
});

export default function CustomerPortalHome({
  activeSection,
  initialData,
  initialPolicyKey = null,
}: {
  activeSection: CustomerSectionKey;
  initialData: CustomerPortalInitialData;
  initialChatSeed?: unknown;
  initialPolicyKey?: PolicyDocumentKey | null;
}) {
  const router = useRouter();
  const [openRequestsCount, setOpenRequestsCount] = useState(initialData.openRequestsCount);
  const [inProgressCount] = useState(initialData.inProgressCount);
  const [waitingCustomerCount] = useState(initialData.waitingCustomerCount);
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

  function openRequest(sessionId: string) {
    router.push(`/portal/requests?request=${encodeURIComponent(sessionId)}`);
  }

  const displayName = profile?.displayName || initialData.displayName;

  return (
    <div key={activeSection} className="support-section-in">
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* A. Account / Welcome Header */}
          <CustomerPortalHero
            customerName={displayName}
            supportAvailable={supportAvailable}
            onNewRequest={goToNewRequest}
          />

          {/* B. 5-Metric KPI Row */}
          <CustomerOverviewCards
            loaded
            openRequestsCount={openRequestsCount}
            inProgressCount={inProgressCount}
            waitingCustomerCount={waitingCustomerCount}
            activeServicesCount={initialData.activeServicesCount || 3}
            recentUpdatesCount={initialData.recentUpdatesCount || 2}
          />

          {/* C. Clean Quick Actions Row */}
          <CustomerQuickActions />

          {/* D. Main Content — Two Columns */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Right / Main Column: Recent Requests (7 Cols) */}
            <section className="lg:col-span-7 rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Inbox className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-black text-[#0F172A]">הפניות האחרונות</h2>
                </div>
                <Link
                  href="/portal/requests"
                  prefetch={true}
                  className="text-xs font-black text-blue-600 transition-colors hover:text-blue-700 flex items-center gap-1"
                >
                  לכל הפניות ←
                </Link>
              </div>

              <CustomerRequestsList
                requests={recentRequests}
                loaded
                onOpenRequest={openRequest}
                onCancelled={refresh}
                limit={4}
              />
            </section>

            {/* Left / Secondary Column: Services & Announcements (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* My Services Card */}
              <section className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Server className="h-4 w-4" />
                    </span>
                    <h2 className="text-sm font-black text-[#0F172A]">השירותים שלי</h2>
                  </div>
                  <Link
                    href="/portal/services"
                    prefetch={true}
                    className="text-xs font-black text-indigo-600 transition-colors hover:text-indigo-700"
                  >
                    ניהול שירותים ←
                  </Link>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-black text-slate-800">שרת מאובטח VPS Cloud</p>
                        <p className="text-[10px] text-slate-400 font-semibold">אזור פרנקפורט · IP ייעודי</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      פעיל
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs font-black text-slate-800">חיבור VPN ארגוני מוצפן</p>
                        <p className="text-[10px] text-slate-400 font-semibold">גישה מרוחקת מאובטחת</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      פעיל
                    </span>
                  </div>
                </div>
              </section>

              {/* Updates Card */}
              <section className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <Bell className="h-4 w-4" />
                    </span>
                    <h2 className="text-sm font-black text-[#0F172A]">הודעות ועדכונים</h2>
                  </div>
                  <Link
                    href="/portal/updates"
                    prefetch={true}
                    className="text-xs font-black text-amber-600 transition-colors hover:text-amber-700"
                  >
                    הכל ←
                  </Link>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        הודעת שירות
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">היום</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 mt-1.5">שדרוג מערכי אחסון ענן</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      בוצע שדרוג ביצועים לתשתיות ה-SSD Cloud ללא השבתת שירות.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* E. Bottom: Recent Activity Feed */}
          <section className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-[#0F172A]">פעילות אחרונה בחשבון</h2>
                <p className="text-[10px] font-semibold text-slate-400">מעקב אחר פתיחת פניות, מענה נציגים ושינויי שירות</p>
              </div>
            </div>

            {initialData.recentActivities.length === 0 ? (
              <div className="py-6 text-center text-xs font-semibold text-slate-400">
                אין פעילות אחרונה להצגה כרגע.
              </div>
            ) : (
              <div className="relative border-r-2 border-slate-100 pr-4 mr-2 space-y-4">
                {initialData.recentActivities.map((act) => (
                  <div key={act.id} className="relative flex items-start justify-between gap-4">
                    <div className="absolute -right-[23px] top-1 h-3 w-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                    <div>
                      <p className="text-xs font-black text-slate-800">{act.message}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {new Date(act.createdAt).toLocaleString("he-IL", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {act.sessionId && (
                      <button
                        type="button"
                        onClick={() => openRequest(act.sessionId)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        צפה בפנייה ←
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
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
  );
}
