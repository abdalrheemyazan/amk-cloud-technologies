import Image from "next/image";
import amkCloudLogo from "../../../public/images/logo.png";

export default function SupportSidebarBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex min-w-0 items-center" aria-label="AMK Cloud Technologies">
        <Image
          src={amkCloudLogo}
          alt="AMK Cloud Technologies"
          sizes="136px"
          quality={100}
          loading="eager"
          className="h-auto w-[136px] max-w-full select-none object-contain"
        />
      </div>
    );
  }

  return (
    <div className="border-b border-slate-100 px-4 py-3.5">
      <div className="relative overflow-hidden rounded-[18px] border border-blue-100/80 bg-[linear-gradient(135deg,#FFFFFF_28%,#F1F7FF_100%)] px-3.5 pb-3 pt-3 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.75)]">
        <span
          className="pointer-events-none absolute -left-7 -top-8 h-20 w-20 rounded-full bg-blue-400/10 blur-2xl"
          aria-hidden="true"
        />
        <Image
          src={amkCloudLogo}
          alt="AMK Cloud Technologies"
          sizes="188px"
          quality={100}
          loading="eager"
          className="relative h-auto w-full select-none object-contain"
        />
        <div className="relative mt-2.5 flex items-center justify-between gap-2 border-t border-blue-100/70 pt-2">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
            Service Desk
          </span>
          <span className="truncate text-[9px] font-bold tracking-wide text-slate-400">
            Support Workspace
          </span>
        </div>
      </div>
    </div>
  );
}
