import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-session";
import { getPortalShellData } from "@/lib/customer-portal-data";
import { isStaffRole } from "@/lib/roles";
import CustomerPortalShell from "@/components/portal/CustomerPortalShell";
import { devTimed } from "@/lib/dev-perf";

// Rendered once and kept mounted across every /portal/* navigation — the
// sidebar, user card, and background no longer remount (and re-fetch) on
// every section switch. Only {children} (the active page) changes.
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getPortalSession();

  if (!session?.user) {
    redirect("/login");
  }
  if (isStaffRole(session.user.role)) {
    redirect("/support/agent");
  }

  const shell = await devTimed("layout:total", () => getPortalShellData(session.user.id as string));

  return (
    <CustomerPortalShell
      userName={shell.displayName}
      userImage={shell.profileImageUrl}
      badges={{ requests: shell.openRequestsCount || undefined }}
    >
      {children}
    </CustomerPortalShell>
  );
}
