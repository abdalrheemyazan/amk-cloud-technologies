import type { ReactNode } from "react";

export default function AnimatedSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`support-section-in ${className}`.trim()}>{children}</div>;
}
