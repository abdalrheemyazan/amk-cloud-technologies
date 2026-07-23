import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPostLoginRedirect } from "@/lib/roles";

export default async function AppRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  redirect(getPostLoginRedirect(session.user.role));
}
