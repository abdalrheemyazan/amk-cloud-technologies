"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export default function ComingSoonButton({
  label,
  icon,
  className = "",
  message = "האפשרות תתווסף בהמשך",
  fullWidth = false,
}: {
  label: string;
  icon?: ReactNode;
  className?: string;
  message?: string;
  fullWidth?: boolean;
}) {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className={`relative ${fullWidth ? "flex w-full" : "inline-flex"}`}>
      <button
        type="button"
        aria-label={label}
        aria-disabled="true"
        onClick={() => {
          setShowMessage(true);
          window.setTimeout(() => setShowMessage(false), 2200);
        }}
        className={className}
      >
        {icon}
        {label}
      </button>
      {showMessage && (
        <span
          role="status"
          className="absolute -top-9 right-1/2 translate-x-1/2 whitespace-nowrap rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-semibold text-white shadow-lg z-20"
        >
          {message}
        </span>
      )}
    </div>
  );
}
