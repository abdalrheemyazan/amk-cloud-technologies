import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  Search, 
  Filter, 
  Plus, 
  MessageSquare,
  Tag,
  ChevronRight,
  User,
  Building,
  HelpCircle as Bot
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusNames: Record<string, string> = {
  OPEN: "חדש",
  IN_PROGRESS: "בטיפול",
  RESOLVED: "הושלם",
  CLOSED: "סגורה",
  CANCELLED: "בוטלה",
};

const statusColors: Record<string, string> = {
  "בטיפול": "bg-blue-50 border-blue-150 text-blue-700",
  "חדש": "bg-indigo-50 border-indigo-150 text-indigo-700",
  "הושלם": "bg-emerald-50 border-emerald-150 text-emerald-700",
  "סגורה": "bg-slate-50 border-slate-200 text-slate-700",
  "בוטלה": "bg-rose-50 border-rose-200 text-rose-700",
};

const priorityNames: Record<string, string> = {
  LOW: "נמוכה",
  MEDIUM: "בינונית",
  HIGH: "גבוהה",
  URGENT: "דחופה",
};

const priorityColors: Record<string, string> = {
  "דחופה": "bg-red-50 border-red-150 text-red-700 font-extrabold",
  "גבוהה": "bg-orange-50 border-orange-150 text-orange-700",
  "בינונית": "bg-amber-50 border-amber-150 text-amber-700",
  "נמוכה": "bg-slate-50 border-slate-200 text-slate-600",
};

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = (session.user as any).role;
  if (role === "CUSTOMER") {
    return <div className="p-8 text-center text-red-600 font-bold">אין הרשאות גישה לדף זה</div>;
  }

  // Fetch all tickets for internal staff
  const dbTickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      agent: true,
      messages: true
    }
  });

  const tickets = dbTickets.map(ticket => ({
    id: ticket.id,
    title: ticket.title,
    category: ticket.category,
    status: statusNames[ticket.status] || ticket.status,
    priority: priorityNames[ticket.priority] || ticket.priority,
    date: new Date(ticket.createdAt).toLocaleDateString("he-IL"),
    customer: ticket.user?.companyName || ticket.user?.name || "לקוח לא ידוע",
    assignedTo: ticket.agent?.name || "טרם שויך",
    messages: ticket.messages.length
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-20" dir="rtl">
      {/* Background glow */}
      <div className="absolute top-0 left-10 w-80 h-80 bg-indigo-50/20 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1 text-right">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">קריאות שירות ומשימות</h1>
          <p className="text-slate-500 text-xs font-semibold">מעקב, תעדוף וטיפול בפניות תמיכה טכנית ותשתיות לקוח.</p>
        </div>
      </header>

      {/* Filters & Search - High-Density SaaS UI */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="חיפוש קריאה לפי כותרת, מזהה, לקוח או טכנאי..."
            className="w-full bg-white border border-slate-250/70 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-250/70 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>סינון</span>
          </button>
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5">
            <button className="px-3.5 py-1.5 bg-white text-slate-800 border border-slate-200/50 shadow-sm rounded-lg text-[11px] font-black">הכל</button>
            <button className="px-3.5 py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-bold transition-colors">בטיפול</button>
            <button className="px-3.5 py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-bold transition-colors">סגורות</button>
          </div>
        </div>
      </div>

      {/* High-Density Row-based Tickets Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header Columns (Visible on desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-450 uppercase tracking-wider text-right">
          <div className="col-span-2">מזהה</div>
          <div className="col-span-3">נושא הקריאה</div>
          <div className="col-span-2">לקוח</div>
          <div className="col-span-2">טכנאי מטפל</div>
          <div className="col-span-1">עדיפות</div>
          <div className="col-span-1">סטטוס</div>
          <div className="col-span-1 text-left">פעולות</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <Link 
              href={`/tickets/${ticket.id}`}
              key={ticket.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-all duration-150 animate-fade-in cursor-pointer"
            >
              {/* ID Column */}
              <div className="col-span-2 flex md:block justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded-md truncate max-w-[120px] inline-block">{ticket.id}</span>
                <span className="md:hidden text-[10px] text-slate-400 font-bold">{ticket.date}</span>
              </div>

              {/* Title & Category Column */}
              <div className="col-span-3 text-right space-y-0.5">
                <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors block">
                  {ticket.title}
                </span>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-350" />
                    {ticket.category}
                  </span>
                  <span>•</span>
                  <span>{ticket.date}</span>
                  {ticket.messages > 0 && (
                    <span className="text-blue-600 flex items-center gap-1 font-bold bg-blue-50/50 px-1.5 py-0.2 rounded">
                      <MessageSquare className="w-2.5 h-2.5" />
                      {ticket.messages}
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Column */}
              <div className="col-span-2 flex md:block items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <Building className="w-3.5 h-3.5 text-slate-450 shrink-0 md:hidden" />
                <span className="md:hidden text-[10px] text-slate-450 font-bold ml-1">לקוח: </span>
                <span className="truncate block">{ticket.customer}</span>
              </div>

              {/* Assigned Technician Column */}
              <div className="col-span-2 flex md:block items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-450 shrink-0 md:hidden" />
                <span className="md:hidden text-[10px] text-slate-450 font-bold ml-1">טכנאי: </span>
                <span className={cn(ticket.assignedTo === "טרם שויך" ? "text-slate-400 italic" : "text-slate-700")}>
                  {ticket.assignedTo}
                </span>
              </div>

              {/* Priority Badge */}
              <div className="col-span-1 flex md:block items-center">
                <span className="md:hidden text-[10px] text-slate-450 font-bold ml-2">עדיפות: </span>
                <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black border", priorityColors[ticket.priority])}>
                  {ticket.priority}
                </span>
              </div>

              {/* Status Badge */}
              <div className="col-span-1 flex md:block items-center">
                <span className="md:hidden text-[10px] text-slate-450 font-bold ml-2">סטטוס: </span>
                <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black border", statusColors[ticket.status] || "bg-slate-50 border-slate-200 text-slate-600")}>
                  {ticket.status}
                </span>
              </div>

              {/* Action Column */}
              <div className="col-span-1 text-left hidden md:flex justify-end">
                <span className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all" title="פרטים נוספים">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </span>
              </div>
            </Link>
          ))}
          {tickets.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm font-semibold">
              אין קריאות שירות להצגה
            </div>
          )}
        </div>
      </div>

      {/* Elegant AI Operations Assistant Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-l from-blue-50/60 via-indigo-50/20 to-transparent border border-blue-100/50 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-blue-100/70 flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 space-y-0.5 text-right">
          <h3 className="text-sm font-black text-slate-800">זקוק לפתרון תקלות אוטומטי מהיר?</h3>
          <p className="text-slate-500 font-semibold text-xs leading-relaxed">
            מערכת ה-AI שלנו מסוגלת לנתח יומני שגיאות ולספק פתרונות מוצעים מיידית, עוד לפני הגעת טכנאי.
          </p>
        </div>
        <Link 
          href="/ai-assistant" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm whitespace-nowrap"
        >
          שאל את ה-AI
        </Link>
      </div>
    </div>
  );
}
