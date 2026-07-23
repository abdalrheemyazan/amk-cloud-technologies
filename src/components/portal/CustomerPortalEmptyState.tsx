import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

export default function CustomerPortalEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-sm font-black text-slate-900">{title}</h2>
      <p className="mt-1.5 max-w-md text-xs font-semibold leading-6 text-slate-500">{description}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_18px_-10px_rgba(37,99,235,0.8)] transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {action.label}
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
