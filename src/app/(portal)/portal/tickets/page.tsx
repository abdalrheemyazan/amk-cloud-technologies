import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Ticket, PlusCircle } from "lucide-react";

import { getTicketStatusLabel, getTicketStatusBadgeClass } from "@/lib/ticket-utils";

export default async function CustomerTicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const tickets = await prisma.ticket.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8" dir="rtl">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">הקריאות שלי</h1>
          <p className="text-slate-500 text-sm">נהל ועקוב אחר סטטוס קריאות השירות שלך.</p>
        </div>
        <Link 
          href="/portal/tickets/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          פתיחת קריאה חדשה
        </Link>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center text-slate-500">
            <Ticket className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg font-semibold text-slate-700">אין קריאות פתוחות כרגע</p>
            <p className="text-sm mt-1 mb-6">כל הקריאות שפתחת או תפתח יופיעו כאן לצורך מעקב.</p>
            <Link 
              href="/portal/tickets/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              פתיחת קריאה חדשה
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.map(ticket => (
              <li key={ticket.id} className="hover:bg-slate-50 transition-colors">
                <Link href={`/portal/tickets/${ticket.id}`} className="block p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">{ticket.title}</h4>
                      <p className="text-slate-500 text-sm">
                        {ticket.category} | נוצר: {new Date(ticket.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getTicketStatusBadgeClass(ticket.status)}`}>
                        {getTicketStatusLabel(ticket.status)}
                      </span>
                      <span className="text-blue-600 hover:text-blue-800 text-sm font-semibold border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                        צפייה בפרטים
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
