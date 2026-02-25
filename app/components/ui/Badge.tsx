"use client";

import React from "react";

type Variant = "neutral" | "info" | "warn" | "danger" | "success";

type Props = React.PropsWithChildren<{
  variant?: Variant;
  className?: string;
  title?: string;
}>;

export function Badge({ variant = "neutral", className = "", title, children }: Props) {
  const base =
    "pixel-heading inline-flex items-center gap-1 rounded-app border-2 border-[color:var(--panel-border)] px-2.5 py-1 text-[0.58rem] leading-none";
  const styles: Record<Variant, string> = {
    neutral: "bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)]",
    info: "bg-[color:var(--accent-strong)] text-[color:var(--accent-primary)]",
    warn: "bg-[color:var(--surface-muted)] text-amber-600 dark:text-amber-300",
    danger: "bg-[color:var(--surface-muted)] text-red-600 dark:text-red-300",
    success: "bg-[color:var(--surface-muted)] text-emerald-600 dark:text-emerald-300",
  };
  return (
    <span className={`${base} ${styles[variant]} ${className}`} title={title}>
      {children}
    </span>
  );
}
