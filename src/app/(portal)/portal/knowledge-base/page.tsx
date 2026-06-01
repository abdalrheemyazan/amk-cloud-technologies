import { prisma } from "@/lib/prisma";
import KnowledgeBaseClient from "./KnowledgeBaseClient";
import { isCustomerSafeArticle, mapCustomerArticle } from "@/lib/knowledge-base";

export default async function KnowledgeBasePage() {
  const articles = await prisma.knowledgeArticle.findMany({
    where: {
      audience: "CUSTOMER",
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      category: true,
      tags: true,
      severity: true,
      audience: true,
      symptoms: true,
      diagnosisSteps: true,
      resolutionSteps: true,
      escalationCriteria: true,
      customerReplyTemplate: true,
      isPublished: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 48,
  });

  const customerArticles = articles
    .filter(isCustomerSafeArticle)
    .map(mapCustomerArticle);

  return <KnowledgeBaseClient articles={customerArticles} />;
}
