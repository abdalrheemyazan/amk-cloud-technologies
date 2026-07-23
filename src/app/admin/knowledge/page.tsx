import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { listKnowledgeDocuments } from "@/lib/actions/knowledge-admin-actions";
import KnowledgeAdminClient from "@/components/admin/KnowledgeAdminClient";

export const metadata: Metadata = {
  title: "מאגר ידע חכם | ניהול AMK",
  description: "העלאת קבצי ידע וניהול האינדקס הסמנטי של הצ׳אט החכם.",
};

export default async function AdminKnowledgePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMINISTRATOR") {
    redirect("/unauthorized");
  }

  const result = await listKnowledgeDocuments();
  const documents = result.ok ? result.data : [];

  return <KnowledgeAdminClient initialDocuments={documents} initialError={result.ok ? null : result.error} />;
}
