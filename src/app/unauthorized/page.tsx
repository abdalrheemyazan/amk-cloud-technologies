import Link from "next/link";
import { ShieldAlert, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-center" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-2">גישה נדחתה</h1>
        <p className="text-slate-500 mb-8">
          אין לך הרשאות לצפות בעמוד זה. אם לדעתך זוהי טעות, אנא פנה למנהל המערכת.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" />
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
