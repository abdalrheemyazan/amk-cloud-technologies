"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SupportSidebarLogoutButton() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      disabled={signingOut}
      onClick={() => void handleSignOut()}
      className="group mt-1 flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-right text-[13px] font-semibold text-slate-500 outline-none transition-all duration-200 ease-out hover:bg-rose-50/70 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-wait disabled:opacity-60"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-transparent text-slate-400 transition-[background-color,color] duration-200 ease-out group-hover:bg-rose-100 group-hover:text-rose-600">
        <LogOut className="h-[15px] w-[15px]" aria-hidden="true" strokeWidth={2.2} />
      </span>
      <span className="flex-1 truncate leading-none">{signingOut ? "מתנתק..." : "התנתקות"}</span>
    </button>
  );
}
