import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { articlesData } from "./articles-data";


const connectionString = process.env.DATABASE_URL?.replace(/\?sslmode=[^&]+/, '') || process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  const users = [
    {
      email: "admin@amk.systems",
      name: "Admin User",
      password: "Admin123!",
      role: "ADMINISTRATOR" as const,
      status: "ACTIVE" as const,
    },
    {
      email: "customer@amk.systems",
      name: "Customer User",
      password: "Customer123!",
      role: "CUSTOMER" as const,
      status: "ACTIVE" as const,
    },
    {
      email: "support@amk.systems",
      name: "Support User",
      password: "Support123!",
      role: "SUPPORT_AGENT" as const,
      status: "ACTIVE" as const,
    },
    {
      email: "technician@amk.systems",
      name: "Technician User",
      password: "Technician123!",
      role: "TECHNICIAN" as const,
      status: "ACTIVE" as const,
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    console.log(`Upserting user: ${user.email} with role ${user.role}...`);

    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        status: user.status,
        name: user.name,
        password: hashedPassword,
      },
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role,
        status: user.status,
      },
    });

    if (user.role === "TECHNICIAN") {
      console.log(`Initializing presence for technician: ${user.email}...`);
      await prisma.technicianPresence.upsert({
        where: { technicianId: upsertedUser.id },
        update: {
          status: "ONLINE",
          lastSeenAt: new Date(),
        },
        create: {
          technicianId: upsertedUser.id,
          status: "ONLINE",
          lastSeenAt: new Date(),
        },
      });
    }
  }

  console.log("Seeding Knowledge Base articles...");
  // Find admin user to set as author
  const admin = await prisma.user.findUnique({ where: { email: "admin@amk.systems" } });
  
  if (admin) {
    for (const article of articlesData) {
      console.log(`Upserting article: ${article.title}...`);
      
      const contentMd = `
**תסמינים:**
${article.symptoms}

**שלבי אבחון:**
${article.diagnosisSteps}

**שלבי פתרון:**
${article.resolutionSteps}

**קריטריונים להסלמה:**
${article.escalationCriteria}
      `.trim();

      await prisma.knowledgeArticle.upsert({
        where: { slug: article.slug },
        update: {
          title: article.title,
          category: article.category,
          content: contentMd,
          tags: article.keywords,
          audience: article.audience,
          severity: article.severity,
          symptoms: article.symptoms,
          diagnosisSteps: article.diagnosisSteps,
          resolutionSteps: article.resolutionSteps,
          escalationCriteria: article.escalationCriteria,
          customerReplyTemplate: article.customerReplyTemplate,
          isPublished: true,
        },
        create: {
          slug: article.slug,
          title: article.title,
          category: article.category,
          content: contentMd,
          tags: article.keywords,
          authorId: admin.id,
          audience: article.audience,
          severity: article.severity,
          symptoms: article.symptoms,
          diagnosisSteps: article.diagnosisSteps,
          resolutionSteps: article.resolutionSteps,
          escalationCriteria: article.escalationCriteria,
          customerReplyTemplate: article.customerReplyTemplate,
          isPublished: true,
        },
      });
    }
  } else {
    console.warn("Admin user not found, skipping KB articles seeding.");
  }

  console.log("Database seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("Error seeding database:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
