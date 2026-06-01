"use client";

import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from "react";
import { PlusCircle, FileText, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewTicketPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("תמיכה טכנית");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError("אנא מלא את כל שדות החובה");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("category", category);
      formData.append("description", description);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/tickets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "אירעה שגיאה בשליחת הקריאה");
      }

      setSuccess(true);
      setSubject("");
      setDescription("");
      setCategory("תמיכה טכנית");
      setFiles([]);

      setTimeout(() => {
        router.push("/portal/tickets");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה בשליחת הקריאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-2">פתיחת קריאה חדשה</h1>
        <p className="text-slate-500 text-sm">מלא את הפרטים למטה וצוות התמיכה שלנו יחזור אליך בהקדם.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold">הקריאה נשלחה בהצלחה! מעביר אותך לקריאות שלך...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">נושא הפנייה <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="למשל: בעיה בחיבור למערכת..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">קטגוריה <span className="text-rose-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="תמיכה טכנית">תמיכה טכנית</option>
                <option value="תקלות רשת">תקלות רשת</option>
                <option value="הנחייה והדרכה">הנחייה והדרכה</option>
                <option value="אחר">אחר</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">פירוט התקלה <span className="text-rose-500">*</span></label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="פרט כמה שניתן על הבעיה..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">צירוף קבצים</label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />
            <div
              onClick={triggerFileSelect}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 select-none ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 text-blue-600 scale-[1.01]"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              לחץ כאן כדי להעלות קבצים או גרור ושחרר
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2 animate-fade-in">
                <p className="text-sm font-bold text-slate-700">קבצים שנבחרו ({files.length}):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 overflow-hidden w-full">
                        <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                        <div className="overflow-hidden text-right w-full">
                          <p className="text-sm font-semibold text-slate-700 truncate w-full" dir="ltr">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0 mr-2"
                        title="הסר קובץ"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={!subject.trim() || !description.trim() || loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-sm border border-transparent"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  שלח קריאה
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
