"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTicketStatusLabel, getTicketStatusBadgeClass } from "@/lib/ticket-utils";
import CancelTicketButton from "./[id]/CancelTicketButton";

interface TicketCardProps {
  ticket: {
    id: string;
    title: string;
    category: string;
    createdAt: Date;
    status: string;
  };
}

export default function TicketCardClient({ ticket }: TicketCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/portal/tickets/${ticket.id}`);
  };

  return (
    <li 
      className="hover:bg-slate-50 transition-colors cursor-pointer block p-6"
      onClick={handleCardClick}
    >
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
          
          <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
            <CancelTicketButton ticketId={ticket.id} currentStatus={ticket.status} />
          </div>

          <Link
            href={`/portal/tickets/${ticket.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
          >
            צפייה בפרטים
          </Link>
        </div>
      </div>
    </li>
  );
}
