"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Clock, User, Tag, HelpCircle as Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const statusNames: Record<string, string> = {
  OPEN: "פתוחה",
  IN_PROGRESS: "בטיפול",
  RESOLVED: "נפתרה",
  CLOSED: "סגורה",
  CANCELLED: "בוטלה",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-indigo-50 border-indigo-150 text-indigo-700",
  IN_PROGRESS: "bg-blue-50 border-blue-150 text-blue-700",
  RESOLVED: "bg-emerald-50 border-emerald-150 text-emerald-700",
  CLOSED: "bg-slate-50 border-slate-200 text-slate-700",
  CANCELLED: "bg-rose-50 border-rose-200 text-rose-700",
};

export default function TicketInteractionClient({
  ticket,
  messages,
}: {
  ticket: any;
  messages: any[];
}) {
  const router = useRouter();
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success'|'error', text: string } | null>(null);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/internal/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });

      if (!res.ok) {
        throw new Error("שגיאה בשליחת התגובה");
      }

      setReplyText("");
      setFeedbackMsg({ type: 'success', text: 'התגובה נשלחה בהצלחה' });
      router.refresh(); // Refresh the Server Component to fetch the new messages
      
      // Auto-hide feedback
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsUpdatingStatus(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/internal/tickets/${ticket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("שגיאה בעדכון הסטטוס");
      }

      setCurrentStatus(newStatus);
      setFeedbackMsg({ type: 'success', text: 'סטטוס הקריאה עודכן בהצלחה' });
      router.refresh();
      
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" dir="rtl">
      {/* Left sidebar - Info & Actions */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">פרטי קריאה</h2>
          
          <div className="space-y-4 text-sm font-semibold text-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">מזהה:</span>
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">{ticket.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">לקוח:</span>
              <span>{ticket.user?.companyName || ticket.user?.name || "לא ידוע"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">אימייל:</span>
              <span className="text-xs">{ticket.user?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">קטגוריה:</span>
              <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-slate-400"/> {ticket.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">עדיפות:</span>
              <span>{ticket.priority}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">נפתחה:</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400"/> {new Date(ticket.createdAt).toLocaleDateString("he-IL")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">עודכן:</span>
              <span>{new Date(ticket.updatedAt).toLocaleDateString("he-IL")}</span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-slate-500 mb-2">שינוי סטטוס</label>
              <div className="relative">
                <select 
                  value={currentStatus}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                  className={cn(
                    "w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 font-bold text-sm transition-all cursor-pointer",
                    statusColors[currentStatus] || "bg-white"
                  )}
                >
                  <option value="OPEN">פתוחה</option>
                  <option value="IN_PROGRESS">בטיפול</option>
                  <option value="RESOLVED">נפתרה</option>
                  <option value="CLOSED">סגורה</option>
                  <option value="CANCELLED">בוטלה</option>
                </select>
                {isUpdatingStatus && <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"/>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Description & Messages */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Feedback Messages */}
        {feedbackMsg && (
          <div className={cn(
            "p-4 rounded-xl text-sm font-bold animate-fade-in",
            feedbackMsg.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-150" : "bg-rose-50 text-rose-700 border border-rose-150"
          )}>
            {feedbackMsg.text}
          </div>
        )}

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-xl font-black text-slate-800 mb-2">{ticket.title}</h1>
            <p className="text-slate-600 font-medium text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </div>

          <div className="p-6 bg-slate-50/50 space-y-6 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-semibold">
                אין תגובות בקריאה זו עדיין.
              </div>
            ) : (
              messages.map((msg) => {
                const isCustomer = msg.sender.role === "CUSTOMER";
                return (
                  <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isCustomer ? "items-start" : "items-end mr-auto")}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        {isCustomer ? <User className="w-3.5 h-3.5 text-slate-500" /> : <Bot className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">{msg.sender?.name || "משתמש"} {isCustomer ? "" : "(תמיכה)"}</span>
                      <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleString("he-IL")}</span>
                    </div>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm font-medium whitespace-pre-wrap shadow-sm",
                      isCustomer 
                        ? "bg-white border border-slate-200/70 text-slate-700 rounded-tr-none" 
                        : "bg-blue-600 text-white rounded-tl-none"
                    )}>
                      {msg.message}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="כתוב תגובה ללקוח..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-500 transition-all resize-none font-medium h-28"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-98"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 rotate-180" />
                  )}
                  שליחת תגובה
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
