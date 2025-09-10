"use client";

import React from "react";

type Variant = "neutral" | "info" | "warn" | "danger" | "success";

type Props = React.PropsWithChildren<{
  variant?: Variant;
  className?: string;
  title?: string;
}>;

export function Badge({ variant = "neutral", className = "", title, children }: Props) {
  const base = "text-[10px] uppercase tracking-wide rounded px-2 py-0.5 ring-1 ring-transparent";
  const styles: Record<Variant, string> = {
    neutral: "bg-zinc-100 text-zinc-800 ring-zinc-300/50 dark:bg-zinc-800/60 dark:text-zinc-100 dark:ring-zinc-500/40",
    info: "bg-blue-100 text-blue-800 ring-blue-300/50 dark:bg-blue-800/50 dark:text-blue-100 dark:ring-blue-500/40",
    warn: "bg-amber-100 text-amber-800 ring-amber-300/50 dark:bg-amber-800/60 dark:text-amber-100 dark:ring-amber-500/40",
    danger: "bg-red-100 text-red-800 ring-red-300/50 dark:bg-red-800/60 dark:text-red-100 dark:ring-red-500/40",
    success: "bg-emerald-100 text-emerald-800 ring-emerald-300/50 dark:bg-emerald-800/50 dark:text-emerald-100 dark:ring-emerald-500/40",
  };
  return (
    <span className={`${base} ${styles[variant]} ${className}`} title={title}>
      {children}
    </span>
  );
}

