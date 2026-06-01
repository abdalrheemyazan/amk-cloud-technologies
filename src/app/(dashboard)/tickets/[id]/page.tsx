import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import TicketInteractionClient from "./TicketInteractionClient";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const INTERNAL_ROLES = [
  "ADMINISTRATOR",
  "SUPPORT_AGENT",
  "TECHNICIAN",
  "TEAM_LEADER",
  "CLOUD_ENGINEER",
];

export default async function InternalTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const role = (session.user as any).role;
  if (!INTERNAL_ROLES.includes(role)) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <h1 className="text-2xl font-bold text-red-600">אין הרשאות גישה</h1>
        <p className="text-slate-500 mt-2">הדף הזה מיועד לצוות התמיכה בלבד.</p>
        <Link href="/portal/tickets" className="text-blue-600 hover:underline mt-4 inline-block">חזור לפורטל</Link>
      </div>
    );
  }

  const ticketId = (await params).id;
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: { id: true, name: true, companyName: true, email: true, phone: true }
      },
      agent: {
        select: { id: true, name: true }
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, name: true, role: true }
          }
        }
      }
    }
  });

  if (!ticket) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto" dir="rtl">
      <header className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-4">
          <Link 
            href="/tickets" 
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">טיפול בקריאה</h1>
            <p className="text-slate-500 text-xs font-semibold">מזהה קריאה: {ticket.id}</p>
          </div>
        </div>
      </header>

      <TicketInteractionClient ticket={ticket} messages={ticket.messages} />
    </div>
  );
}
