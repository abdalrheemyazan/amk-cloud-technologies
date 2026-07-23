import { Info, ShieldAlert, ClipboardList } from "lucide-react";

type LegalNoticeVariant = "info" | "warning" | "todo";

const VARIANT_STYLES: Record<LegalNoticeVariant, { wrap: string; icon: typeof Info }> = {
  info: { wrap: "bg-blue-50/80 border-blue-100 text-blue-900", icon: Info },
  warning: { wrap: "bg-amber-50/90 border-amber-200/70 text-amber-900", icon: ShieldAlert },
  todo: { wrap: "bg-slate-100/80 border-slate-200 text-slate-700", icon: ClipboardList },
};

export default function LegalNotice({
  variant = "info",
  children,
}: {
  variant?: LegalNoticeVariant;
  children: React.ReactNode;
}) {
  const { wrap, icon: Icon } = VARIANT_STYLES[variant];
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold leading-7 ${wrap}`}>
      <Icon className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
