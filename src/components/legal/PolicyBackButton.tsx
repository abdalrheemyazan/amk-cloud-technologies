import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PolicyBackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3.5 text-xs font-black text-slate-600 shadow-sm outline-none backdrop-blur transition-[border-color,color,box-shadow,transform] hover:-translate-y-px hover:border-blue-200 hover:text-blue-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      {label}
    </Link>
  );
}
