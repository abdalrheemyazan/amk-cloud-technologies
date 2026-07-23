import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";

// Legacy customer route — the customer portal now lives at /portal.
// Kept as a redirector so old links and bookmarks still land somewhere useful.
export default async function LegacySupportRedirect() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  redirect(isStaffRole(session.user.role) ? "/support/agent" : "/portal");
}
