"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export default function SidebarNavItem({
  label,
  icon: Icon,
  active = false,
  badge,
  onClick,
  href,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <>
      <span
        className={`absolute inset-y-1.5 right-0 w-[3px] origin-center rounded-l-full bg-blue-600 transition-[opacity,transform] duration-200 ease-out ${
          active ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0"
        }`}
        aria-hidden="true"
      />

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-200 ease-out ${
          active
            ? "scale-[1.03] bg-blue-100 text-blue-600"
            : "bg-transparent text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700"
        }`}
      >
        <Icon className="h-[15px] w-[15px]" aria-hidden="true" strokeWidth={2.2} />
      </span>

      <span className="flex-1 truncate text-right leading-none transition-colors duration-200 ease-out">{label}</span>

      {!!badge && badge > 0 && (
        <span className="ml-0.5 flex h-[18px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black tabular-nums text-white shadow-sm transition-transform duration-200 ease-out group-hover:scale-105">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );

  const className = `group relative flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-[13px] font-semibold transition-all duration-200 ease-out ${
    active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  }`;

  if (href) {
    return (
      <Link
        href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
        className={className}
    >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" aria-current={active ? "page" : undefined} onClick={onClick} className={className}>
      {content}
    </button>
  );
}
