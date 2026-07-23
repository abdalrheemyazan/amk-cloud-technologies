"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function RefreshDataButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      setJustRefreshed(true);
      window.setTimeout(() => setJustRefreshed(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      aria-label="רענון נתונים"
      className={className}
    >
      <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
      {justRefreshed && !isPending ? "עודכן" : "רענון נתונים"}
    </button>
  );
}
