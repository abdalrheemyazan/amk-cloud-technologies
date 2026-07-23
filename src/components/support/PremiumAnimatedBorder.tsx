import type { ReactNode } from "react";
import styles from "./PremiumAnimatedBorder.module.css";

export default function PremiumAnimatedBorder({
  children,
  className = "",
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "support-header";
}) {
  if (variant === "support-header") {
    // Normal gray border on the card itself; the animated blue/cyan accent is a
    // separate masked ring painted on top of the content's edge afterward, so
    // only a thin line moves — never the whole border.
    return (
      <div
        data-premium-border="support-header"
        className={`${styles.headerFrame} border border-slate-200 bg-white ${className}`}
      >
        <div>{children}</div>
        <div className={styles.headerRunner} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      data-premium-border="animated"
      className={`${styles.border} ${className}`}
    >
      <div data-premium-border-surface className={styles.surface}>
        {children}
      </div>
    </div>
  );
}
