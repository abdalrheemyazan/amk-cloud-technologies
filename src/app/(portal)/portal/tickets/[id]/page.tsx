import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, Tag, AlertCircle, FileText, CheckCircle2, MessageSquare, User } from "lucide-react";
import CancelTicketButton from "./CancelTicketButton";

// Mappings for status
const statusNames: Record<string, string> = {
  OPEN: "פתוחה",
  IN_PROGRESS: "בטיפול",
  RESOLVED: "נפתרה",
  CLOSED: "סגורה",
  CANCELLED: "בוטלה",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-50 border-blue-200 text-blue-700",
  IN_PROGRESS: "bg-amber-50 border-amber-200 text-amber-700",
  RESOLVED: "bg-emerald-50 border-emerald-200 text-emerald-700",
  CLOSED: "bg-slate-50 border-slate-200 text-slate-500",
  CANCELLED: "bg-rose-50 border-rose-200 text-rose-700",
};

const priorityNames: Record<string, string> = {
  LOW: "נמוכה",
  MEDIUM: "בינונית",
  HIGH: "גבוהה",
  URGENT: "דחופה",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-50 border-slate-200 text-slate-600",
  MEDIUM: "bg-amber-50 border-amber-200 text-amber-700",
  HIGH: "bg-orange-50 border-orange-200 text-orange-700",
  URGENT: "bg-red-50 border-red-200 text-red-700 font-bold",
};

// Parser for attachments stored inside description
function parseTicketDescription(fullDescription: string) {
  const parts = fullDescription.split("\n\n---\n📎 קבצים מצורפים:\n");
  const description = parts[0];
  const attachmentsText = parts[1] || "";
  
  const attachments: { name: string; url: string }[] = [];
  if (attachmentsText) {
    const lines = attachmentsText.split("\n");
    for (const line of lines) {
      // Line format: - [name](url) or - name: url
      const match = line.match(/^-\s*\[(.*?)\]\((.*?)\)/);
      if (match) {
        attachments.push({ name: match[1], url: match[2] });
      } else {
        const simpleMatch = line.match(/^-\s*(.*?):\s*(.*?)$/);
        if (simpleMatch) {
          attachments.push({ name: simpleMatch[1], url: simpleMatch[2] });
        }
      }
    }
  }
  
  return { description, attachments };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const { id: ticketId } = await params;
  const loggedUserId = (session.user as any).id;
  const loggedUserRole = (session.user as any).role;

  let ticket = null;

  try {
    ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        ...(loggedUserRole === "CUSTOMER" ? { userId: loggedUserId } : {})
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        cancellationReason: true,
        cancelledAt: true,
        userId: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            message: true,
            createdAt: true,
            senderId: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Portal ticket details failed:", error);
  }

  if (!ticket) {
    notFound();
  }

  // Security Check: Ensure that CUSTOMER can only view their own ticket
  if (loggedUserRole === "CUSTOMER" && ticket.userId !== loggedUserId) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4" dir="rtl">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">גישה נדחתה</h1>
        <p className="text-slate-500 text-sm">אין לך הרשאות לצפות בקריאה זו. היא אינה משויכת לחשבון שלך.</p>
        <div className="pt-2">
          <Link
            href="/portal/tickets"
            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            חזרה לרשימת הקריאות שלי
          </Link>
        </div>
      </div>
    );
  }

  const { description, attachments } = parseTicketDescription(ticket.description);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/portal/tickets" className="hover:text-blue-600 transition-colors">הקריאות שלי</Link>
            <span>/</span>
            <span className="text-slate-500">פרטי קריאה</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">קריאה #{ticket.id.slice(-6).toUpperCase()}</h1>
        </div>
        <Link
          href="/portal/tickets"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs transition-all self-start sm:self-auto"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          חזרה לקריאות שלי
        </Link>
      </header>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-450 block uppercase">נושא הפנייה</span>
            <h2 className="text-xl font-black text-slate-900 leading-tight">{ticket.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 border text-xs font-bold rounded-full ${statusColors[ticket.status] || ""}`}>
              {statusNames[ticket.status] || ticket.status}
            </span>
            <span className={`px-3 py-1 border text-xs font-bold rounded-full ${priorityColors[ticket.priority] || ""}`}>
              עדיפות: {priorityNames[ticket.priority] || ticket.priority}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 text-sm">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold text-xs block">קטגוריה</span>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <Tag className="w-4 h-4 text-slate-400" />
              {ticket.category}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold text-xs block">תאריך פתיחה</span>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <Clock className="w-4 h-4 text-slate-400" />
              {new Date(ticket.createdAt).toLocaleDateString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold text-xs block">עדכון אחרון</span>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <Clock className="w-4 h-4 text-slate-400" />
              {new Date(ticket.updatedAt).toLocaleDateString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Cancellation details banner if cancelled */}
        {ticket.status === "CANCELLED" && (
          <div className="p-5 bg-rose-50/50 border-b border-rose-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-800">
              <p className="text-sm font-black text-rose-800">קריאה זו בוטלה על ידי הלקוח</p>
              {ticket.cancellationReason && (
                <p className="text-xs font-semibold text-rose-700">
                  <span className="font-extrabold">סיבת ביטול:</span> {ticket.cancellationReason}
                </p>
              )}
              {ticket.cancelledAt && (
                <p className="text-[10px] text-slate-400">
                  בוטל בתאריך: {new Date(ticket.cancelledAt).toLocaleString("he-IL")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Description body */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">פירוט הפנייה</h3>
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {description}
          </div>
        </div>

        {/* Attached Files Section if they exist */}
        {attachments.length > 0 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">קבצים מצורפים ({attachments.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition-all select-none group"
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full pl-2">
                    <FileText className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 truncate block transition-colors text-right w-full" dir="ltr">
                      {file.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 group-hover:underline shrink-0">הורדה</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Messages (Chat) Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          היסטוריית עדכונים ומסרים ({ticket.messages.length})
        </h3>

        {ticket.messages.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-semibold">
            אין הודעות أو עדכונים בקריאה זו כרגע.
          </div>
        ) : (
          <div className="space-y-4">
            {ticket.messages.map((message) => {
              const isSenderMe = message.senderId === loggedUserId;
              return (
                <div
                  key={message.id}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs font-medium space-y-1.5 ${
                    isSenderMe
                      ? "mr-auto bg-blue-600 text-white rounded-tl-none shadow-sm"
                      : "ml-auto bg-slate-50 border border-slate-200 text-slate-800 rounded-tr-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-6 text-[10px] opacity-75 font-bold">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{isSenderMe ? "אני" : message.sender.name || "נציג תמיכה"}</span>
                      {!isSenderMe && (
                        <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-md text-[8px] scale-95 font-extrabold">
                          {message.sender.role === "TECHNICIAN" ? "טכנאי" : "נציג"}
                        </span>
                      )}
                    </div>
                    <span>
                      {new Date(message.createdAt).toLocaleString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="leading-relaxed whitespace-pre-wrap break-words">
                    {message.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Footer Bar (Only display cancel button if not CANCELLED or CLOSED) */}
      {ticket.status !== "CANCELLED" && ticket.status !== "CLOSED" && (
        <div className="flex justify-end p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
          <CancelTicketButton ticketId={ticket.id} currentStatus={ticket.status} />
        </div>
      )}
    </div>
  );
}
