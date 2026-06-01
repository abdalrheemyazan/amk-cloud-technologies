import CustomerSidebar from "@/components/layout/CustomerSidebar";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Double check: if an internal user tries to access /portal, they should be redirected back to /dashboard
  // Wait, let internal users test the portal or redirect them?
  // It's safer to just redirect them back to their dashboard, or let them view it.
  // The requirements say CUSTOMER must be redirected to /portal. It didn't explicitly say INTERNAL users can't see the portal, but let's separate them.
  if ((session.user as any)?.role !== "CUSTOMER") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex" dir="rtl">
      <CustomerSidebar />
      <main className="flex-1 mr-[270px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
