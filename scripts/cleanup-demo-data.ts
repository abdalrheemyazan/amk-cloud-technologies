import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let connectionString = process.env.DATABASE_URL || "";
const hasSsl = connectionString.includes("sslmode=") || connectionString.includes("supabase.com") || connectionString.includes("aws-");
connectionString = connectionString.replace(/[\?&]sslmode=[^&]+/g, "");

const pool = new pg.Pool({
  connectionString,
  ssl: hasSsl ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runCleanup() {
  const isExecute = process.argv.includes("--execute");
  const isDryRun = process.argv.includes("--dry-run") || !isExecute;

  console.log("\n=======================================================");
  console.log(`🧹 AMK PRE-DEPLOYMENT DATA CLEANUP [${isExecute ? "EXECUTE MODE" : "DRY-RUN MODE"}]`);
  console.log("=======================================================\n");

  try {
    // 1. Find all users in DB
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
      },
    });

    console.log("📋 Users in Database:");
    for (const u of allUsers) {
      console.log(` - ID: ${u.id} | Name: "${u.name || ""}" | Display: "${u.displayName || ""}" | Email: ${u.email} | Role: ${u.role}`);
    }

    // 2. Identify target customer "נור אלדין חסין"
    const targetCustomer = allUsers.find(
      (u) =>
        (u.name && u.name.includes("נור")) ||
        (u.displayName && u.displayName.includes("נור")) ||
        u.email.includes("customer") ||
        u.role === "CUSTOMER"
    );

    // 3. Identify target support user "יזן עבד אל רחיים"
    const targetSupportUser = allUsers.find(
      (u) =>
        (u.name && u.name.includes("יזן")) ||
        (u.displayName && u.displayName.includes("יזן")) ||
        u.email.includes("support") ||
        u.role === "SUPPORT_AGENT" ||
        u.role === "ADMINISTRATOR"
    );

    console.log("\n🎯 Target Customer Resolution:");
    if (targetCustomer) {
      console.log(`   Customer Found: ${targetCustomer.name || targetCustomer.displayName} (${targetCustomer.email}) -> ID: ${targetCustomer.id}`);
    } else {
      console.log("   ⚠️ Customer 'נור אלדין חסין' not matched specifically. Scanning all CUSTOMER role users.");
    }

    console.log("\n🎯 Target Support User Resolution (PRESERVED):");
    if (targetSupportUser) {
      console.log(`   Support User Found: ${targetSupportUser.name || targetSupportUser.displayName} (${targetSupportUser.email}) -> ID: ${targetSupportUser.id}`);
    }

    // Customer ID to clean
    const customerIdsToClean = targetCustomer ? [targetCustomer.id] : allUsers.filter((u) => u.role === "CUSTOMER").map((u) => u.id);

    // 4. Find all sessions / tickets associated with target customer
    const sessions = await prisma.supportSession.findMany({
      where: {
        customerId: { in: customerIdsToClean },
      },
      select: {
        id: true,
        subject: true,
        category: true,
        status: true,
        createdAt: true,
      },
    });

    const sessionIds = sessions.map((s) => s.id);

    // 5. Count related records
    const [
      sessionCount,
      messageCount,
      attachmentCount,
      noteCount,
      activityCount,
      transferCount,
      remoteCount,
      internalMsgCount,
      classicTicketsCount,
      classicTicketMessagesCount,
    ] = await Promise.all([
      prisma.supportSession.count({ where: { id: { in: sessionIds } } }),
      prisma.sessionMessage.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.supportAttachment.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.technicianNote.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.supportActivity.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.supportTransfer.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.remoteConnectionRequest.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.internalSupportMessage.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.ticket.count({ where: { userId: { in: customerIdsToClean } } }),
      prisma.ticketMessage.count({ where: { ticket: { userId: { in: customerIdsToClean } } } }),
    ]);

    console.log("\n📊 Scope of Test Data to Clean:");
    console.log(`   - Support Sessions (Tickets/Chats): ${sessionCount}`);
    console.log(`   - Session Messages: ${messageCount}`);
    console.log(`   - Attachments: ${attachmentCount}`);
    console.log(`   - Internal Technician Notes: ${noteCount}`);
    console.log(`   - Support Activity Timeline: ${activityCount}`);
    console.log(`   - Support Transfers: ${transferCount}`);
    console.log(`   - Remote Connection Requests: ${remoteCount}`);
    console.log(`   - Internal Support Messages linked to sessions: ${internalMsgCount}`);
    console.log(`   - Classic Tickets: ${classicTicketsCount}`);
    console.log(`   - Classic Ticket Messages: ${classicTicketMessagesCount}`);

    if (isDryRun) {
      console.log("\n🔍 DRY-RUN COMPLETE: No changes were written to the database.");
      console.log("   To execute the cleanup, run: npm run cleanup:demo -- --execute\n");
      return;
    }

    // 6. EXECUTE TRANSACTIONAL CLEANUP
    console.log("\n🚀 Executing clean-up transaction...");

    await prisma.$transaction(async (tx) => {
      // Clear technician presence active links if pointing to deleted sessions
      await tx.technicianPresence.updateMany({
        where: {
          OR: [
            { currentSupportSessionId: { in: sessionIds } },
            { currentTicketId: { in: sessionIds } },
          ],
        },
        data: {
          currentSupportSessionId: null,
          currentTicketId: null,
          activeChatsCount: 0,
        },
      });

      // Delete attachments
      await tx.supportAttachment.deleteMany({
        where: {
          OR: [
            { sessionId: { in: sessionIds } },
            { sessionMessage: { sessionId: { in: sessionIds } } },
          ],
        },
      });

      // Delete messages
      await tx.sessionMessage.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });

      // Delete technician notes
      await tx.technicianNote.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });

      // Delete support activities
      await tx.supportActivity.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });

      // Delete transfers
      await tx.supportTransfer.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });

      // Delete remote connection requests
      await tx.remoteConnectionRequest.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });

      // Delete internal support messages linked to sessions
      await tx.internalSupportMessage.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });

      // Delete support sessions
      await tx.supportSession.deleteMany({
        where: { id: { in: sessionIds } },
      });

      // Delete classic ticket messages & tickets
      await tx.ticketMessage.deleteMany({
        where: { ticket: { userId: { in: customerIdsToClean } } },
      });

      await tx.ticket.deleteMany({
        where: { userId: { in: customerIdsToClean } },
      });
    });

    console.log("✅ Cleanup transaction successfully committed!");

    // 7. Verification of Clean Database State
    const [
      remainingSessions,
      remainingMessages,
      remainingNotes,
      remainingActivities,
      remainingTickets,
    ] = await Promise.all([
      prisma.supportSession.count({ where: { customerId: { in: customerIdsToClean } } }),
      prisma.sessionMessage.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.technicianNote.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.supportActivity.count({ where: { sessionId: { in: sessionIds } } }),
      prisma.ticket.count({ where: { userId: { in: customerIdsToClean } } }),
    ]);

    console.log("\n=======================================================");
    console.log("📈 Final Verification Database Counts:");
    console.log(`   - Customer Support Sessions: ${remainingSessions} (Expected: 0)`);
    console.log(`   - Customer Ticket Messages: ${remainingMessages} (Expected: 0)`);
    console.log(`   - Customer Internal Notes: ${remainingNotes} (Expected: 0)`);
    console.log(`   - Customer Activity Log: ${remainingActivities} (Expected: 0)`);
    console.log(`   - Customer Classic Tickets: ${remainingTickets} (Expected: 0)`);
    console.log("=======================================================\n");

    const totalUsers = await prisma.user.count();
    const totalArticles = await prisma.knowledgeArticle.count();
    const totalServices = await prisma.service.count();
    const totalPrepared = await prisma.preparedResponse.count();

    console.log("🛡️ Preserved System Entities:");
    console.log(`   - User Accounts: ${totalUsers}`);
    console.log(`   - Knowledge Base Articles: ${totalArticles}`);
    console.log(`   - Services: ${totalServices}`);
    console.log(`   - Prepared Responses: ${totalPrepared}`);
    console.log("=======================================================\n");

  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void runCleanup();
