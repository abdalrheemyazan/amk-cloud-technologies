"use client";

import { Users, Search, Plus, Filter, Mail, Phone, Shield } from "lucide-react";

export default function CustomersPage() {
  const customers = [
    { name: "אלקטרה בע\"מ", contact: "ישראל ישראלי", email: "israel@electra.co.il", phone: "050-1234567", status: "פעיל", sla: "Premium S1" },
    { name: "בנק הפועלים", contact: "שירה לוי", email: "shira@poalim.co.il", phone: "054-7654321", status: "פעיל", sla: "Mission Critical" },
    { name: "אקמאי טכנולוגיות", contact: "רון ארד", email: "ron@akamai.co.il", phone: "052-8889999", status: "פעיל", sla: "Enterprise" },
    { name: "סיבוס סאדקסו", contact: "דנה כהן", email: "dana@cibus.co.il", phone: "053-1112222", status: "מושהה", sla: "Standard" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">ניהול לקוחות ואובייקטים</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">רשימת ארגונים מנוהלים ורמת SLA פעילה במערכת</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
          <Plus className="w-4 h-4" />
          <span>הוספת לקוח חדש</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש לקוחות, אימייל או איש קשר..."
            className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>סינון</span>
          </button>
          <button className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 flex items-center gap-1.5">
            <span>יצוא לאקסל</span>
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black">
                <th className="p-4">שם הארגון</th>
                <th className="p-4">איש קשר</th>
                <th className="p-4">פרטי התקשרות</th>
                <th className="p-4">רמת SLA</th>
                <th className="p-4 text-center">סטטוס</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {customers.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-extrabold text-slate-900">{c.name}</td>
                  <td className="p-4 text-slate-600 font-semibold">{c.contact}</td>
                  <td className="p-4 text-slate-500 font-medium">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px]">
                      <Shield className="w-3 h-3 text-indigo-500" />
                      {c.sla}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      c.status === "פעיל" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-left">
                    <button className="text-indigo-600 hover:text-indigo-900 font-black">ניהול</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
