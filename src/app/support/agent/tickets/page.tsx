import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Role, TicketPriority, TicketStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/roles";
import SupportWorkspace from "@/components/support/SupportWorkspace";
import SupportErrorState from "@/components/support/SupportErrorState";
import {
  DEFAULT_SUPPORT_SECTION,
  isSupportSectionKey,
  type TechnicianNoteItem,
  type TechnicianTicket,
} from "@/lib/support-types";

export const metadata: Metadata = {
  title: "לוח טכנאי | AMK Cloud Technologies",
  description: "ניהול משימות טיפול, חיבורים מרחוק וסיוע מהיר ללקוחות.",
};

const TICKET_INCLUDE = {
  user: { select: { name: true, email: true, phone: true, companyName: true } },
  agent: { select: { name: true } },
  messages: {
    orderBy: { createdAt: "asc" as const },
    include: { sender: { select: { name: true } } },
  },
};

type RawTicket = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  agentId: string | null;
  user: { name: string | null; email: string; phone: string | null; companyName: string | null } | null;
  agent: { name: string | null } | null;
  messages: { id: string; message: string; createdAt: Date; senderId: string; sender: { name: string | null } | null }[];
};

function mapTicket(ticket: RawTicket): TechnicianTicket {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    agentId: ticket.agentId,
    agentName: ticket.agent?.name ?? null,
    customerName: ticket.user?.name ?? null,
    customerEmail: ticket.user?.email ?? null,
    customerPhone: ticket.user?.phone ?? null,
    customerCompany: ticket.user?.companyName ?? null,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      message: m.message,
      createdAt: m.createdAt,
      senderName: m.sender?.name ?? null,
      isFromCustomer: m.senderId === ticket.userId,
    })),
  };
}

type TechnicianData = {
  kpis: { openTasks: number; waitingRemote: number; urgent: number; completedToday: number };
  tasks: TechnicianTicket[];
  historyTasks: TechnicianTicket[];
  remoteSessions: { id: string; customerName: string | null; connectionType: string | null; connectionStatus: string | null; createdAt: Date }[];
  waitingCustomers: { id: string; customerName: string | null; createdAt: Date }[];
  technicianNotes: TechnicianNoteItem[];
  emailNotifications: boolean;
};

async function loadTechnicianData(userId: string): Promise<TechnicianData | null> {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      openTasksCount,
      urgentCount,
      completedTodayCount,
      waitingRemoteCount,
      myTasksRaw,
      historyTasksRaw,
      remoteSessionsRaw,
      waitingCustomersRaw,
      technicianNotesRaw,
      currentUser,
    ] = await Promise.all([
      prisma.ticket.count({
        where: { agentId: userId, status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] } },
      }),
      prisma.ticket.count({
        where: {
          agentId: userId,
          status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
          priority: { in: [TicketPriority.HIGH, TicketPriority.URGENT] },
        },
      }),
      prisma.ticket.count({
        where: { agentId: userId, status: TicketStatus.RESOLVED, updatedAt: { gte: startOfToday } },
      }),
      prisma.remoteConnectionRequest.count({
        where: { status: "PENDING", session: { technicianId: userId } },
      }),
      prisma.ticket.findMany({
        where: { agentId: userId },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: TICKET_INCLUDE,
      }),
      prisma.ticket.findMany({
        where: { agentId: userId, status: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] } },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: TICKET_INCLUDE,
      }),
      prisma.supportSession.findMany({
        where: { technicianId: userId, status: { in: ["PENDING", "ACTIVE"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { name: true } },
          remotes: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      prisma.supportSession.findMany({
        where: { technicianId: null, status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 5,
        include: { customer: { select: { name: true } } },
      }),
      prisma.technicianNote.findMany({
        where: { technicianId: userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { emailNotifications: true } }),
    ]);

    return {
      kpis: {
        openTasks: openTasksCount,
        waitingRemote: waitingRemoteCount,
        urgent: urgentCount,
        completedToday: completedTodayCount,
      },
      tasks: myTasksRaw.map(mapTicket),
      historyTasks: historyTasksRaw.map(mapTicket),
      remoteSessions: remoteSessionsRaw.map((sessionItem) => ({
        id: sessionItem.id,
        customerName: sessionItem.customer?.name ?? null,
        connectionType: sessionItem.remotes[0]?.connectionType ?? null,
        connectionStatus: sessionItem.remotes[0]?.status ?? null,
        createdAt: sessionItem.createdAt,
      })),
      waitingCustomers: waitingCustomersRaw.map((sessionItem) => ({
        id: sessionItem.id,
        customerName: sessionItem.customer?.name ?? null,
        createdAt: sessionItem.createdAt,
      })),
      technicianNotes: technicianNotesRaw.map((note) => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
      })),
      emailNotifications: currentUser?.emailNotifications ?? true,
    };
  } catch (error) {
    console.error("Failed to load technician workspace data:", error);
    return null;
  }
}

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function TicketDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!STAFF_ROLES.includes(session.user.role as Role)) {
    redirect("/portal");
  }

  const userId = session.user.id as string;
  const userRole = (session.user.role as Role) ?? null;
  const userName = session.user.name ?? null;

  const params = await searchParams;
  const sectionParam = typeof params.section === "string" ? params.section : undefined;
  const initialSection = isSupportSectionKey(sectionParam) ? sectionParam : DEFAULT_SUPPORT_SECTION;

  const data = await loadTechnicianData(userId);

  if (!data) {
    return <SupportErrorState userName={userName} userRole={userRole} />;
  }

  return (
    <SupportWorkspace
      userName={userName}
      userRole={userRole}
      initialSection={initialSection}
      kpis={data.kpis}
      tasks={data.tasks}
      historyTasks={data.historyTasks}
      remoteSessions={data.remoteSessions}
      waitingCustomers={data.waitingCustomers}
      technicianNotes={data.technicianNotes}
      initialEmailNotifications={data.emailNotifications}
    />
  );
}
