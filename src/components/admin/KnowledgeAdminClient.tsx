"use client";

import { useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import {
  deleteKnowledgeDocument,
  reprocessKnowledgeDocument,
  syncArticlesToKnowledgeBase,
  uploadKnowledgeDocument,
  type KnowledgeDocumentView,
} from "@/lib/actions/knowledge-admin-actions";
import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog";

const AUDIENCE_LABELS: Record<string, string> = {
  CUSTOMER_VISIBLE: "גלוי ללקוחות",
  SUPPORT_INTERNAL: "פנימי לתמיכה",
  TECHNICIAN_ONLY: "טכנאים בלבד",
};

const STATUS_META: Record<string, { label: string; wrap: string; icon: typeof Clock }> = {
  UPLOADED: { label: "הועלה", wrap: "bg-slate-100 text-slate-600", icon: Clock },
  PROCESSING: { label: "מעבד...", wrap: "bg-blue-50 text-blue-700", icon: Loader2 },
  READY: { label: "מוכן", wrap: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  FAILED: { label: "נכשל", wrap: "bg-rose-50 text-rose-600", icon: XCircle },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KnowledgeAdminClient({
  initialDocuments,
  initialError,
}: {
  initialDocuments: KnowledgeDocumentView[];
  initialError: string | null;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeDocumentView | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [syncing, startSync] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function refreshFromServer() {
    // uploadKnowledgeDocument / reprocess / delete already revalidate the path;
    // a full reload keeps this simple client in sync with the server list.
    window.location.reload();
  }

  function handleUploadSubmit(formData: FormData) {
    setError(null);
    setNotice(null);
    startUpload(async () => {
      const result = await uploadKnowledgeDocument(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      setNotice("הקובץ הועלה ונשלח לעיבוד.");
      refreshFromServer();
    });
  }

  function handleReprocess(id: string) {
    setError(null);
    setBusyId(id);
    reprocessKnowledgeDocument(id).then((result) => {
      setBusyId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refreshFromServer();
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    deleteKnowledgeDocument(deleteTarget.id).then((result) => {
      setDeleteSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  function handleSyncArticles() {
    setError(null);
    setNotice(null);
    startSync(async () => {
      const result = await syncArticlesToKnowledgeBase();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(`סונכרנו ${result.data.synced} מאמרים${result.data.failed ? `, ${result.data.failed} נכשלו` : ""}.`);
      refreshFromServer();
    });
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F4F7FB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_-34px_rgba(15,23,42,0.55)]">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">ניהול AMK</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">מאגר ידע חכם</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-500">
            קבצים שמועלים כאן מפוצלים לקטעים, מקודדים ל-embeddings ונשמרים באינדקס וקטורי. הצ׳אט
            החכם של הלקוחות מחפש לפי משמעות (לא לפי מילת מפתח בלבד) ועונה רק מתוך קטעים שנמצאו רלוונטיים.
          </p>
        </header>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{error}</div>
        ) : null}
        {notice ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">{notice}</div>
        ) : null}

        <section className="rounded-[22px] border border-slate-200 bg-white p-5" aria-labelledby="upload-title">
          <h2 id="upload-title" className="text-sm font-black text-slate-950">העלאת קובץ ידע</h2>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">PDF או TXT, עד 15MB. לצ׳אט הלקוחות יש לבחור קהל &quot;גלוי ללקוחות&quot;.</p>

          <form
            ref={formRef}
            action={handleUploadSubmit}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1.5 text-xs font-black text-slate-700">
              כותרת המסמך
              <input
                name="title"
                required
                maxLength={200}
                className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="לדוגמה: מדריך חיבור VPN"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-black text-slate-700">
              קטגוריה (אופציונלי)
              <input
                name="category"
                maxLength={80}
                className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="לדוגמה: VPN"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-black text-slate-700">
              קהל יעד
              <select
                name="audience"
                defaultValue="CUSTOMER_VISIBLE"
                className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-black text-slate-700">
              קובץ
              <input
                name="file"
                type="file"
                required
                accept="application/pdf,text/plain"
                className="h-10 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 outline-none file:ml-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-[10px] file:font-black file:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-black text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60"
              >
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                {uploading ? "מעלה ומעבד..." : "העלאה ועיבוד"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[22px] border border-slate-200 bg-white p-5" aria-labelledby="documents-title">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="documents-title" className="text-sm font-black text-slate-950">מסמכים באינדקס</h2>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">{documents.length} מסמכים</p>
            </div>
            <button
              type="button"
              onClick={handleSyncArticles}
              disabled={syncing}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 text-[11px] font-black text-blue-700 outline-none transition-colors hover:border-blue-300 hover:bg-blue-100/70 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} aria-hidden="true" />
              סנכרון מאמרי ידע קיימים
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 py-10 text-center text-xs font-semibold text-slate-500">
              עדיין אין מסמכים באינדקס. העלה קובץ למעלה או לחץ &quot;סנכרון מאמרי ידע קיימים&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    <th className="px-2 py-2">מסמך</th>
                    <th className="px-2 py-2">קהל</th>
                    <th className="px-2 py-2">סטטוס</th>
                    <th className="px-2 py-2">קטעים</th>
                    <th className="px-2 py-2">גודל</th>
                    <th className="px-2 py-2">נוצר</th>
                    <th className="px-2 py-2">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => {
                    const statusMeta = STATUS_META[document.status] ?? STATUS_META.UPLOADED;
                    const StatusIcon = statusMeta.icon;
                    const isBusy = busyId === document.id;

                    return (
                      <tr key={document.id} className="border-b border-slate-100 align-top last:border-0">
                        <td className="px-2 py-3">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900">{document.title}</p>
                              <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
                                {document.sourceType === "ARTICLE" ? "מסונכרן ממאמר ידע" : document.fileName}
                              </p>
                              {document.errorMessage ? (
                                <p className="mt-1 max-w-xs text-[10px] font-bold text-rose-600">{document.errorMessage}</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 font-semibold text-slate-600">{AUDIENCE_LABELS[document.audience] ?? document.audience}</td>
                        <td className="px-2 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${statusMeta.wrap}`}>
                            <StatusIcon className={`h-3 w-3 ${document.status === "PROCESSING" ? "animate-spin" : ""}`} aria-hidden="true" />
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="px-2 py-3 font-semibold text-slate-600">{document.chunkCount}</td>
                        <td className="px-2 py-3 font-semibold text-slate-600">{document.sourceType === "ARTICLE" ? "—" : formatSize(document.sizeBytes)}</td>
                        <td className="px-2 py-3 font-semibold text-slate-600">{formatDate(document.createdAt)}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleReprocess(document.id)}
                              disabled={isBusy || document.status === "PROCESSING"}
                              aria-label="עיבוד מחדש"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 outline-none transition-colors hover:border-blue-200 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${isBusy ? "animate-spin" : ""}`} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(document)}
                              aria-label="מחיקת מסמך"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 outline-none transition-colors hover:border-rose-200 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {deleteTarget ? (
        <ConfirmActionDialog
          title="מחיקת מסמך ידע"
          description={`למחוק את "${deleteTarget.title}"? הקטעים המקושרים יימחקו והם לא ישמשו עוד את הצ׳אט החכם.`}
          confirmLabel="מחיקה"
          submitting={deleteSubmitting}
          error={null}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            if (deleteSubmitting) return;
            setDeleteTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}
