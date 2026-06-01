"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CancelTicketButtonProps {
  ticketId: string;
  currentStatus: string;
}

export default function CancelTicketButton({ ticketId, currentStatus }: CancelTicketButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  if (currentStatus === "CANCELLED" || currentStatus === "CLOSED") {
    return null;
  }

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === "אחר" ? customReason : reason;

    if (!finalReason || !finalReason.trim()) {
      setError("אנא בחר או הזן סיבת ביטול");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/portal/tickets/${ticketId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: finalReason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "אירעה שגיאה בביטول הקריאה");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה בביטول הקריאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 font-bold rounded-xl transition-all text-sm shrink-0"
      >
        ביטול קריאה
      </button>

      {/* Confirmation Dialog Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">ביטול קריאת שירות</h3>
                <p className="text-slate-500 text-xs mt-0.5">האם אתה בטוח שברצונך לבטל את קריאה זו?</p>
              </div>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4 pt-2">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 rounded-lg text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">אנא בחר סיבת ביטול:</label>
                <select
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError("");
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- בחר סיבה --</option>
                  <option value="הבעיה נפתרה">הבעיה נפתרה</option>
                  <option value="פתחתי קריאה בטעות">פתחתי קריאה בטעות</option>
                  <option value="אין צורך בטיפול כרגע">אין צורך בטיפול כרגע</option>
                  <option value="מצאתי פתרון אחר">מצאתי פתרון אחר</option>
                  <option value="אחר">אחר (פירוט חופשי)</option>
                </select>
              </div>

              {reason === "אחר" && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-xs font-bold text-slate-700 block">פרט את הסיבה:</label>
                  <textarea
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value);
                      setError("");
                    }}
                    rows={3}
                    placeholder="כתוב כאן את סיבת הביטול..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                  disabled={loading}
                >
                  חזור
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      מבטל...
                    </>
                  ) : (
                    "אשר ביטול קריאה"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
