import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Ticket, 
  PlusCircle, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  UserCircle,
  FileText
} from "lucide-react";
import { getTicketStatusLabel, getTicketStatusBadgeClass } from "@/lib/ticket-utils";

// Fallback logic for test titles
function getCleanTitle(title: string) {
  if (!title) return "קריאת שירות ללא כותרת";
  const trimmed = title.trim();
  if (trimmed.length < 3) return "קריאת שירות ללא כותרת";
  if (/^\d+$/.test(trimmed)) return "קריאת שירות ללא כותרת";
  if (/^(ב+|א+|ג+|ד+|ה+|ו+|ז+|ח+|ט+|י+|כ+|ל+|מ+|נ+|ס+|ע+|פ+|צ+|ק+|ר+|ש+|ת+)$/.test(trimmed)) return "קריאת שירות ללא כותרת";
  return title;
}

export default async function CustomerPortalPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || !(session.user as any).id) {
    return (
      <div className="p-12 text-center" dir="rtl">
        <h2 className="text-xl font-bold text-red-600">שגיאת התחברות</h2>
        <p className="text-slate-500 mt-2">אנא התחבר מחדש למערכת.</p>
      </div>
    );
  }

  const userId = (session.user as any).id;
  const userName = session.user.name || "לקוח";

  let userTickets: any[] = [];
  let openCount = 0;
  let inProgressCount = 0;
  let closedCount = 0;
  let kbArticles: any[] = [];

  try {
    // 1. Fetch only this user's tickets (exclude CANCELLED)
    userTickets = await prisma.ticket.findMany({
      where: { 
        userId: userId,
        status: { not: "CANCELLED" }
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        createdAt: true
      }
    });

    // 2. Fetch ticket stats
    openCount = await prisma.ticket.count({
      where: { userId, status: "OPEN" }
    });
    
    inProgressCount = await prisma.ticket.count({
      where: { userId, status: "IN_PROGRESS" }
    });
    
    closedCount = await prisma.ticket.count({
      where: { userId, status: { in: ["CLOSED", "RESOLVED", "CANCELLED"] } }
    });

    // 3. Fetch Knowledge Base articles (Customer safe only)
    kbArticles = await prisma.knowledgeArticle.findMany({
      where: {
        isPublished: true,
        audience: "CUSTOMER"
      },
      orderBy: { createdAt: "desc" },
      take: 3
    });
  } catch (error) {
    console.error("Customer portal render failed:", error);
    // Don't crash the page, just use empty states
  }

  return (
    <div className="bg-[#F4F7FB] min-h-screen font-sans pb-20 text-[#0F172A]" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* Welcome Hero */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#E2E8F0] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Soft blue gradient background accent */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-[#0F172A]">
              שלום, {userName} 👋
            </h1>
            <p className="text-[#64748B] text-lg max-w-xl">
              כאן ניתן לפתוח קריאות שירות, לעקוב אחר טיפול ולמצוא פתרונות במאגר הידע.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <Link 
              href="/portal/tickets/new"
              className="flex justify-center items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              פתיחת קריאה חדשה
            </Link>
            <Link 
              href="/portal/knowledge-base"
              className="flex justify-center items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-4 px-8 rounded-2xl border border-slate-200 transition-all"
            >
              <BookOpen className="w-5 h-5 text-slate-500" />
              מאגר ידע
            </Link>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-[#64748B] font-medium text-sm mb-1">קריאות פתוחות</h3>
              <span className="text-3xl font-black text-[#0F172A]">{openCount}</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-[#64748B] font-medium text-sm mb-1">קריאות בטיפול</h3>
              <span className="text-3xl font-black text-[#0F172A]">{inProgressCount}</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-[#64748B] font-medium text-sm mb-1">קריאות שנסגרו</h3>
              <span className="text-3xl font-black text-[#0F172A]">{closedCount}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Column: Recent Tickets */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-[#0F172A]">הקריאות האחרונות שלי</h2>
            </div>
            
            {userTickets.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-[#F8FAFF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="w-10 h-10 text-blue-300" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">עדיין לא פתחת קריאות שירות</h3>
                <p className="text-[#64748B] mb-8 max-w-sm mx-auto">
                  אם יש לך תקלה או שאלה, ניתן לפתוח קריאה וצוות התמיכה של AMK יחזור אליך.
                </p>
                <Link 
                  href="/portal/tickets/new"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#2563EB] text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <PlusCircle className="w-5 h-5 ml-2" />
                  פתיחת קריאה חדשה
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {userTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          #{ticket.id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTicketStatusBadgeClass(ticket.status)}`}>
                          {getTicketStatusLabel(ticket.status)}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#0F172A] text-lg mb-1 group-hover:text-blue-600 transition-colors">
                        {getCleanTitle(ticket.title)}
                      </h4>
                      <div className="flex items-center gap-4 text-xs font-medium text-[#64748B]">
                        <span>{ticket.category || "כללי"}</span>
                        <span>•</span>
                        <span>נוצר: {new Date(ticket.createdAt).toLocaleDateString("he-IL")}</span>
                      </div>
                    </div>
                    <Link 
                      href={`/portal/tickets/${ticket.id}`}
                      className="inline-flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium py-2.5 px-5 rounded-xl border border-slate-200 hover:border-blue-200 transition-all shrink-0"
                    >
                      צפייה בקריאה
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </Link>
                  </div>
                ))}
                
                <Link 
                  href="/portal/tickets"
                  className="block text-center py-4 text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-white rounded-2xl border border-[#E2E8F0] hover:bg-blue-50/50"
                >
                  צפייה בכל הקריאות
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar Column: Quick Actions & KB */}
          <div className="space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#0F172A] mb-6">פעולות מהירות</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/portal/tickets/new" className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#F8FAFF] hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">קריאה חדשה</span>
                </Link>
                <Link href="/portal/tickets" className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">כל הקריאות</span>
                </Link>
                <Link href="/portal/knowledge-base" className="flex flex-col items-center text-center p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-transparent hover:border-emerald-200 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-emerald-200/50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">מאגר ידע</span>
                </Link>
                <Link href="/portal/profile" className="flex flex-col items-center text-center p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-transparent hover:border-purple-200 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-purple-200/50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">עדכון פרופיל</span>
                </Link>
              </div>
            </div>

            {/* Knowledge Base Suggestions */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#0F172A] mb-6">מדריכים שיכולים לעזור</h2>
              
              {kbArticles.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-2xl">
                  אין מדריכים זמינים כרגע
                </div>
              ) : (
                <div className="space-y-4">
                  {kbArticles.map(article => (
                    <Link 
                      key={article.id} 
                      href={`/portal/knowledge-base/${article.slug}`}
                      className="block p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#0F172A] text-sm group-hover:text-blue-600 mb-1 line-clamp-1">
                            {article.title}
                          </h4>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {article.category || "כללי"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link 
                    href="/portal/knowledge-base"
                    className="block text-center pt-2 text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors"
                  >
                    צפייה בכל המדריכים &larr;
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
