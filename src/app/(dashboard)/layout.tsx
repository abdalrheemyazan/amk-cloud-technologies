import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Double check: do not let customers access the internal dashboard layout
  if ((session.user as any)?.role === "CUSTOMER") {
    redirect("/portal");
  }

  return (
    <SidebarProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}
