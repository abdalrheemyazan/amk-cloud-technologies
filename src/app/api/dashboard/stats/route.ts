import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "משתמש לא מחובר", 
          stats: { 
            openTickets: 0, 
            totalTickets: 0,
            responseTime: "0.0", 
            activeServers: 0, 
            systemAlerts: 0,
            activeTechnicians: 0,
            pendingRegistrations: 0,
            knowledgeArticles: 0,
            openSupportSessions: 0,
            aiRequests: 0,
            aiSuggestions: 0
          }, 
          tickets: [], 
          alerts: [], 
          technicians: [], 
          services: [], 
          auditLogs: [],
          chartData: []
        },
        { status: 200 } // Keep status 200 to prevent fetch crashes during auth transition
      );
    }

    if ((session.user as any).role === "CUSTOMER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // 1. Define all queries to run in parallel
    const [
      ticketsRaw,
      openTicketsCount,
      totalTicketsCount,
      alerts,
      systemAlertsCount,
      techsRaw,
      services,
      activeServersCount,
      logsRaw
    ] = await Promise.all([
      prisma.ticket.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, email: true } }, agent: { select: { name: true } } }
      }).catch(() => []),
      prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }).catch(() => 0),
      prisma.ticket.count().catch(() => 0),
      prisma.monitoringAlert.findMany({ orderBy: { timestamp: "desc" }, take: 5 }).catch(() => []),
      prisma.monitoringAlert.count().catch(() => 0),
      prisma.user.findMany({
        where: { role: "TECHNICIAN" },
        select: { id: true, name: true, email: true, presence: { select: { status: true, currentTicketId: true, currentSupportSessionId: true, lastSeenAt: true } } }
      }).catch(() => []),
      prisma.service.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []),
      prisma.service.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, email: true } } }
      }).catch(() => [])
    ]);

    // 2. Format Tickets
    const tickets = ticketsRaw.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      user: t.user?.name || t.user?.email || "משתמש לא ידוע",
      status: t.status === "OPEN" ? "חדש" : t.status === "IN_PROGRESS" ? "בטיפול" : t.status === "RESOLVED" ? "פתור" : "סגור",
      priority: t.priority === "URGENT" ? "דחופה" : t.priority === "HIGH" ? "גבוהה" : t.priority === "MEDIUM" ? "בינונית" : "נמוכה",
      assignedTo: t.agent?.name || null,
      createdAt: t.createdAt.toISOString()
    }));

    // 3. Format Technicians
    const technicians = techsRaw.map(t => ({
      id: t.id,
      name: t.name || "טכנאי ללא שם",
      email: t.email,
      status: t.presence?.status || "OFFLINE",
      currentTicketId: t.presence?.currentTicketId || null,
      currentSupportSessionId: t.presence?.currentSupportSessionId || null,
      lastSeenAt: t.presence?.lastSeenAt.toISOString() || new Date().toISOString()
    }));
    const activeTechniciansCount = techsRaw.filter(t => t.presence && t.presence.status !== "OFFLINE").length;

    // 4. Format Audit Logs
    const auditLogs = logsRaw.map(l => ({
      id: l.id,
      action: l.action,
      details: l.details || "",
      user: l.user?.name || l.user?.email || "מערכת",
      timestamp: l.createdAt.toISOString()
    }));

    // 6. Fetch pending registration requests, open support sessions, & knowledge articles
    let pendingRegistrations = 0;
    let openSupportSessions = 0;
    let knowledgeArticles = 0;
    try {
      pendingRegistrations = await prisma.user.count({
        where: { status: "PENDING" }
      });
      openSupportSessions = await prisma.supportSession.count({
        where: { status: { in: ["PENDING", "ACTIVE"] } }
      });
      knowledgeArticles = await prisma.knowledgeArticle.count();
    } catch (e) {
      console.warn("Metadata statistics calculation query skipped:", e);
    }

    // 7. Calculate real average response time (in minutes) based on actual first replies
    let avgResponseTime = 0.0;
    try {
      // Optimizied: fetching only recent tickets to avoid full table scan
      const ticketsWithMessages = await prisma.ticket.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 1, // We only need the first message to check if it's from a non-customer
            include: {
              sender: {
                select: { role: true }
              }
            }
          }
        }
      });
      
      let totalDiffMinutes = 0;
      let countResponded = 0;
      
      for (const t of ticketsWithMessages) {
        const firstResponse = t.messages.find(m => m.sender?.role !== "CUSTOMER");
        if (firstResponse) {
          const diffMs = firstResponse.createdAt.getTime() - t.createdAt.getTime();
          const diffMins = diffMs / (1000 * 60);
          if (diffMins > 0) {
            totalDiffMinutes += diffMins;
            countResponded++;
          }
        }
      }
      
      if (countResponded > 0) {
        avgResponseTime = parseFloat((totalDiffMinutes / countResponded).toFixed(1));
      }
    } catch (e) {
      console.warn("Error calculating average response time:", e);
    }

    // 8. Query real database counts for AI requests from AuditLog
    let aiRequests = 0;
    let aiSuggestions = 0;
    try {
      aiRequests = await prisma.auditLog.count({
        where: { action: "AI_ASSISTANT_QUERY" }
      });
      aiSuggestions = await prisma.auditLog.count({
        where: { action: "AI_TICKET_SUGGESTION" }
      });
    } catch (e) {
      console.warn("AI statistics query skipped:", e);
    }

    // 9. Generate REAL 7-day historical dataset dynamically in parallel (Massive speed improvement)
    const chartData: any[] = [];
    try {
      const now = new Date();
      const promises = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        
        const label = date.toLocaleDateString("he-IL", { weekday: "short", day: "numeric" });
        
        promises.push((async () => {
          const [dayTickets, dayAlerts, daySessions] = await Promise.all([
            prisma.ticket.count({
              where: {
                createdAt: {
                  gte: date,
                  lt: nextDate
                }
              }
            }).catch(() => 0),
            prisma.monitoringAlert.count({
              where: {
                timestamp: {
                  gte: date,
                  lt: nextDate
                }
              }
            }).catch(() => 0),
            prisma.supportSession.count({
              where: {
                createdAt: {
                  gte: date,
                  lt: nextDate
                }
              }
            }).catch(() => 0)
          ]);
          
          return { name: label, tickets: dayTickets, alerts: dayAlerts, sessions: daySessions, index: i };
        })());
      }
      
      const results = await Promise.all(promises);
      // Sort from oldest (i = 6) to newest (i = 0)
      results.sort((a, b) => b.index - a.index);
      
      chartData.push(...results.map(r => ({
        name: r.name,
        tickets: r.tickets,
        alerts: r.alerts,
        sessions: r.sessions
      })));
    } catch (e) {
      console.warn("Dynamic chart data generation failed:", e);
    }

    const stats = {
      openTickets: openTicketsCount,
      totalTickets: totalTicketsCount,
      responseTime: avgResponseTime.toFixed(1),
      activeServers: activeServersCount,
      systemAlerts: systemAlertsCount,
      activeTechnicians: activeTechniciansCount,
      pendingRegistrations,
      knowledgeArticles,
      openSupportSessions,
      aiRequests,
      aiSuggestions
    };

    return NextResponse.json({
      success: true,
      stats,
      tickets,
      alerts,
      technicians,
      services,
      auditLogs,
      chartData
    });
  } catch (error: any) {
    console.error("Critical error in NOC stats endpoint:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "NOC API Internal Failure", 
        stats: { 
          openTickets: 0, 
          totalTickets: 0,
          responseTime: "0.0", 
          activeServers: 0, 
          systemAlerts: 0,
          activeTechnicians: 0,
          pendingRegistrations: 0,
          knowledgeArticles: 0,
          openSupportSessions: 0,
          aiRequests: 0,
          aiSuggestions: 0
        },
        tickets: [],
        alerts: [],
        technicians: [],
        services: [],
        auditLogs: [],
        chartData: []
      },
      { status: 200 }
    );
  }
}
