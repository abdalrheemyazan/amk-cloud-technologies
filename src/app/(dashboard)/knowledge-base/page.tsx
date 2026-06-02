"use client";

import { 
  Search, 
  BookOpen, 
  FileText, 
  ChevronLeft, 
  Clock, 
  User,
  Star,
  ArrowLeft,
  TrendingUp,
  Tag,
  CheckCircle2,
  HelpCircle,
  BookOpen as BookIcon,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const categories = [
  "הכל",
  "מדריכי VPS",
  "אבטחת מידע",
  "מסדי נתונים",
  "רשתות",
  "דוא״ל ו-VOIP",
];

const articles = [
  {
    id: 1,
    title: "כיצד להגדיר שרת VPS חדש ב-AMK Cloud",
    excerpt: "מדריך שלב אחר שלב להגדרת שרת ה-Linux הראשון שלך, כולל הגדרות אבטחה בסיסיות, חומת אש והרשאות SSH.",
    category: "מדריכי VPS",
    author: "אבי כהן",
    date: "12 מאי 2026",
    reads: "1.2k",
    verified: true,
    slug: "setup-vps"
  },
  {
    id: 2,
    title: "הגדרת גיבוי אוטומטי למסדי נתונים",
    excerpt: "למדו איך להשתמש בכלי הגיבוי המובנים שלנו כדי להבטיח שהנתונים שלכם תמיד מוגנים בצורה אוטומטית.",
    category: "מסדי נתונים",
    author: "דנה לוי",
    date: "10 מאי 2026",
    reads: "850",
    verified: true,
    slug: "database-auto-backup"
  },
  {
    id: 3,
    title: "שיטות עבודה מומלצות לאבטחת SSL",
    excerpt: "מדריך מקיף על ניהול תעודות SSL, התקנת LetsEncrypt והגנה על התקשורת שלכם מפני מתקפות ציתות.",
    category: "אבטחת מידע",
    author: "משה לוי",
    date: "08 מאי 2026",
    reads: "2.4k",
    verified: false,
    slug: "ssl-best-practices"
  }
];

export default function KnowledgeBase() {
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === "הכל" || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 text-right select-none" dir="rtl">
      
      {/* Header and Search Area */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider">
            <BookOpen className="w-3 h-3" />
            מאגר ידע ומדריכים
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">מאגר המידע הטכני</h1>
          <p className="text-slate-500 text-xs font-semibold">מדריכים טכניים, פתרון תקלות נפוצות והסברים על תשתיות הענן של AMK.</p>
        </div>
        
        {/* Modern Linear-Style Search Field */}
        <div className="relative w-full lg:w-80 group">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text"
            placeholder="חפש מדריך או פתרון..."
            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-2 pr-10 pl-8 text-xs text-slate-950 placeholder:text-slate-450 transition-all font-bold shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono text-slate-400 pointer-events-none">
            /
          </div>
        </div>
      </header>

      {/* Category Pills Filters */}
      <div className="flex flex-wrap gap-2 pt-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              selectedCategory === cat 
                ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Layout (Notion + Linear feel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Articles List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article, i) => (
              <Link 
                href={`/knowledge-base/${article.slug}`}
                key={article.id}
                className="bg-white border border-slate-200/85 hover:border-blue-200 hover:shadow-[0_4px_12px_rgba(59,130,246,0.02)] rounded-2xl p-6 transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group cursor-pointer block"
              >
                <div className="space-y-3.5 flex-1 w-full">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-slate-150 border border-slate-200 text-slate-600 text-[9px] font-black tracking-wide uppercase">
                      {article.category}
                    </span>
                    {article.verified && (
                      <span className="flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        מאומת AMK
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1 w-full">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-500">
                          {article.author[0]}
                        </div>
                        <span className="text-slate-600">{article.author}</span>
                      </div>
                      <span className="text-slate-200 font-light">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{article.date}</span>
                      </div>
                      <span className="text-slate-200 font-light">•</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{article.reads} קוראים</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end w-full md:w-auto">
                  <span className="px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 border border-slate-200/80 group-hover:border-blue-600">
                    קרא עוד
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-300" />
              <div className="space-y-1">
                <h4 className="text-slate-800 font-black text-sm">אין מדריכים התואמים לחיפוש</h4>
                <p className="text-slate-400 text-xs font-semibold">נסה לשנות את מילת החיפוש או לבחור קטגוריה אחרת.</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Widgets (1 Col) */}
        <div className="space-y-6">
          
          {/* Popular articles widget */}
          <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              מאמרים פופולריים
            </h3>
            
            <div className="space-y-3">
              {[
                { title: "הגדרת אימות דו-שלבי (2FA) לטכנאים", cat: "אבטחה", reads: "2.4k" },
                { title: "מדריך מהיר להגדרת NAT בשרתי פיתוח", cat: "רשתות", reads: "1.8k" },
                { title: "פתרון שגיאת 502 Bad Gateway נפוצה", cat: "מדריכים", reads: "1.5k" }
              ].map((item, idx) => (
                <div key={idx} className="group cursor-pointer py-1.5 flex flex-col gap-1 text-right">
                  <p className="text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                    <span className="text-slate-500 uppercase">{item.cat}</span>
                    <span className="text-slate-200">•</span>
                    <span>{item.reads} קריאות</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to action panel */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-650 rounded-2xl p-6 text-white shadow-md shadow-blue-500/10 space-y-4 text-right">
            <div className="space-y-1">
              <h3 className="text-sm font-black">לא מצאת פתרון?</h3>
              <p className="text-blue-100 text-xs font-semibold leading-relaxed">
                טכנאי ה-NOC המנוסים שלנו זמינים עבורך כעת. פתח קריאת שירות מקיפה.
              </p>
            </div>
            <a 
              href="/tickets/new" 
              className="inline-flex w-full py-2.5 bg-white text-blue-700 hover:bg-slate-50 rounded-xl justify-center font-black text-xs transition-all shadow-sm text-center"
            >
              פתיחת קריאת שירות
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
