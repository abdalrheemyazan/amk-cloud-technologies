"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Copy,
  Edit2,
  Filter,
  Layers,
  MessageSquarePlus,
  Plus,
  Power,
  PowerOff,
  Search,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import type { PreparedResponseCategory, ResponseScope } from "@prisma/client";
import {
  createPreparedResponse,
  deletePreparedResponse,
  duplicatePreparedResponse,
  getPreparedResponses,
  updatePreparedResponse,
  type PreparedResponseView,
} from "@/lib/actions/prepared-response-actions";

const CATEGORY_LABELS: Record<PreparedResponseCategory, string> = {
  GREETING: "ברכת שלום ופתיחה",
  REQUEST_INFORMATION: "בקשת מידע ופרטים",
  WAITING: "הודעת המתנה",
  FOLLOW_UP: "מעקב ובדיקת תקינות",
  RESOLUTION: "הצעת פתרון וסיכום",
  CLOSING: "סיום וסגירה",
  OTHER: "שונות וטכני",
};

const CATEGORY_COLORS: Record<PreparedResponseCategory, string> = {
  GREETING: "bg-blue-50 text-blue-700 border-blue-100",
  REQUEST_INFORMATION: "bg-purple-50 text-purple-700 border-purple-100",
  WAITING: "bg-amber-50 text-amber-700 border-amber-100",
  FOLLOW_UP: "bg-sky-50 text-sky-700 border-sky-100",
  RESOLUTION: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CLOSING: "bg-slate-100 text-slate-700 border-slate-200",
  OTHER: "bg-rose-50 text-rose-700 border-rose-100",
};

export default function PreparedResponsesManager({
  userRole,
  onSelectResponse,
}: {
  userRole: string | null;
  onSelectResponse?: (text: string) => void;
}) {
  const [items, setItems] = useState<PreparedResponseView[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScope, setActiveScope] = useState<ResponseScope | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<PreparedResponseCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PreparedResponseView | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<PreparedResponseCategory>("GREETING");
  const [formContent, setFormContent] = useState("");
  const [formScope, setFormScope] = useState<ResponseScope>("PERSONAL");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canManageTeam = userRole === "ADMINISTRATOR" || userRole === "TEAM_LEADER";

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const result = await getPreparedResponses({
      scope: activeScope,
      category: selectedCategory,
      search: searchQuery,
    });
    if (result.ok) {
      setItems(result.data);
    } else {
      setNotice({ text: result.error, type: "error" });
    }
    setLoading(false);
  }, [activeScope, selectedCategory, searchQuery]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const result = await getPreparedResponses({
        scope: activeScope,
        category: selectedCategory,
        search: searchQuery,
      });
      if (!ignore) {
        if (result.ok) {
          setItems(result.data);
        } else {
          setNotice({ text: result.error, type: "error" });
        }
        setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [activeScope, selectedCategory, searchQuery]);

  function openCreateModal(defaultScope: ResponseScope = "PERSONAL") {
    setEditingItem(null);
    setFormTitle("");
    setFormCategory("GREETING");
    setFormContent("");
    setFormScope(canManageTeam && defaultScope === "TEAM" ? "TEAM" : "PERSONAL");
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(item: PreparedResponseView) {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormContent(item.content);
    setFormScope(item.scope);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSaveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setFormError("נא למלא כותרת ותוכן לתגובה.");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    if (editingItem) {
      const result = await updatePreparedResponse(editingItem.id, {
        title: formTitle,
        category: formCategory,
        content: formContent,
        scope: formScope,
      });
      if (result.ok) {
        setIsModalOpen(false);
        setNotice({ text: "התגובה המוכנה עודכנה בהצלחה.", type: "success" });
        fetchItems();
      } else {
        setFormError(result.error);
      }
    } else {
      const result = await createPreparedResponse({
        title: formTitle,
        category: formCategory,
        content: formContent,
        scope: formScope,
      });
      if (result.ok) {
        setIsModalOpen(false);
        setNotice({ text: "תגובה מוכנה חדשה נוצרה בהצלחה.", type: "success" });
        fetchItems();
      } else {
        setFormError(result.error);
      }
    }
    setFormSubmitting(false);
  }

  async function handleToggleActive(item: PreparedResponseView) {
    const result = await updatePreparedResponse(item.id, { isActive: !item.isActive });
    if (result.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isActive: !i.isActive } : i))
      );
      setNotice({
        text: item.isActive ? "התגובה הועברה ללא פעילה." : "התגובה הופעלה בהצלחה.",
        type: "success",
      });
    } else {
      setNotice({ text: result.error, type: "error" });
    }
  }

  async function handleDuplicate(item: PreparedResponseView) {
    const result = await duplicatePreparedResponse(item.id);
    if (result.ok) {
      setNotice({ text: `נוצר עותק אישי של "${item.title}" בהצלחה.`, type: "success" });
      fetchItems();
    } else {
      setNotice({ text: result.error, type: "error" });
    }
  }

  async function handleDelete(item: PreparedResponseView) {
    if (!window.confirm(`האם את/ה בטוח/ה שברצונך למחוק את "${item.title}"?`)) return;
    const result = await deletePreparedResponse(item.id);
    if (result.ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setNotice({ text: "התגובה נמחקה בהצלחה.", type: "success" });
    } else {
      setNotice({ text: result.error, type: "error" });
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            ניהול תגובות מוכנות
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            מאגר תבניות מענה מהירות ומקצועיות. לחיצה על תגובה בחלון השיחה תכניס אותה לתיבת הטקסט לעריכה ושליחה ידנית (ללא שליחה אוטומטית).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openCreateModal("PERSONAL")}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
            תגובה חדשה
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-bold ${
            notice.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className={`text-[11px] font-black ${
              notice.type === "error" ? "text-rose-600 hover:text-rose-800" : "text-emerald-600 hover:text-emerald-800"
            }`}
          >
            סגור
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-[20px] border border-slate-200/80 bg-white p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Scope selection */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveScope("ALL")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeScope === "ALL"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              הכל
            </button>
            <button
              type="button"
              onClick={() => setActiveScope("PERSONAL")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeScope === "PERSONAL"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              תגובות אישיות
            </button>
            <button
              type="button"
              onClick={() => setActiveScope("TEAM")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeScope === "TEAM"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              תגובות צוות
            </button>
          </div>

          {/* Search box */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש בכותרת או בתוכן..."
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 pr-8 pl-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="flex items-center gap-1 font-bold text-slate-400 shrink-0 text-[11px]">
            <Filter className="h-3 w-3" />
            קטגוריה:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all shrink-0 ${
              selectedCategory === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            הכל ({items.length})
          </button>
          {(Object.keys(CATEGORY_LABELS) as PreparedResponseCategory[]).map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {CATEGORY_LABELS[cat]} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[20px] border border-slate-200 bg-white p-10 text-center">
          <MessageSquarePlus className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-black text-slate-800">אין תגובות מוכנות.</p>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            ניתן ליצור תבניות מענה אישיות או צוותיות לייעול המענה ללקוחות.
          </p>
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            תגובה חדשה
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-2xl border p-4 bg-white shadow-sm transition-all hover:shadow-md ${
                item.isActive ? "border-slate-200/80" : "border-slate-200 bg-slate-50/50 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black ${
                          CATEGORY_COLORS[item.category]
                        }`}
                      >
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          item.scope === "TEAM"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.scope === "TEAM" ? (
                          <>
                            <Users className="h-2.5 w-2.5" /> תבנית צוות
                          </>
                        ) : (
                          <>
                            <User className="h-2.5 w-2.5" /> אישית
                          </>
                        )}
                      </span>
                      {!item.isActive && (
                        <span className="rounded bg-rose-50 text-rose-600 px-1.5 py-0.5 text-[9px] font-bold">
                          לא פעילה
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 mt-1 truncate">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {item.canEdit && (
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        title={item.isActive ? "השבת תגובה" : "הפעל תגובה"}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.isActive
                            ? "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                            : "text-slate-400 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {item.isActive ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(item)}
                      title="שכפל כתבנית אישית"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {item.canEdit && (
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        title="ערוך תגובה"
                        className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {item.canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        title="מחק תגובה"
                        className="p-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100 whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-semibold text-slate-400">
                <span>
                  {item.scope === "TEAM" ? "תבנית צוותית מורשית" : `נוצר על ידי: ${item.creatorName || "אתה"}`}
                </span>
                {onSelectResponse && (
                  <button
                    type="button"
                    onClick={() => onSelectResponse(item.content)}
                    className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    הכנס לחלון השיחה ←
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900">
                {editingItem ? "עריכת תגובה מוכנה" : "יצירת תגובה מוכנה חדשה"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">כותרת התגובה</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="לדוגמה: בקשת צילום מסך, הודעת פתיחה וכו'"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-slate-800 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">קטגוריה</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PreparedResponseCategory)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-2.5 text-slate-800 outline-none focus:border-blue-500 bg-white"
                  >
                    {(Object.keys(CATEGORY_LABELS) as PreparedResponseCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                {canManageTeam && (
                  <div>
                    <label className="block font-black text-slate-700 mb-1">היקף שיתוף (Scope)</label>
                    <select
                      value={formScope}
                      onChange={(e) => setFormScope(e.target.value as ResponseScope)}
                      className="w-full h-10 rounded-xl border border-slate-200 px-2.5 text-slate-800 outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="PERSONAL">אישי (רק עבורי)</option>
                      <option value="TEAM">צוותי (לכל נציגי התמיכה)</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">תוכן התגובה</label>
                <textarea
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="הזן את נוסח התגובה שישובץ לתיבת ההודעה..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-800 outline-none focus:border-blue-500 resize-none leading-relaxed"
                  required
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  הערה: בעת שימוש, התוכן יוזן לתיבת הכתיבה עבור הנציג לבדיקה ולעריכה לפני שליחה ידנית.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-black text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {formSubmitting ? "שומר..." : editingItem ? "שמור שינויים" : "צור תגובה"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
