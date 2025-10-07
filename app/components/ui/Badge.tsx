"use client";

import React from "react";

type Variant = "neutral" | "info" | "warn" | "danger" | "success";

type Props = React.PropsWithChildren<{
  variant?: Variant;
  className?: string;
  title?: string;
}>;

export function Badge({ variant = "neutral", className = "", title, children }: Props) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium";
  const styles: Record<Variant, string> = {
    neutral: "bg-foreground/5 text-secondary-text",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-100",
    warn: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100",
    danger: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-100",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100",
  };
  return (
    <span className={`${base} ${styles[variant]} ${className}`} title={title}>
      {children}
    </span>
  );
}
