"use client";

import React from "react";

type Props = {
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
};

function labelFromVaultId(id: string): string {
  const base = (id.split(".")[0] || id);
  const m = base.match(/vault-(\d+)/i);
  if (m) return m[1];
  const alt = base.match(/(\d+)/);
  if (alt) return alt[1];
  return base.slice(0, 2).toUpperCase();
}

export function VaultIcon({ id, size = "md", className = "", title }: Props) {
  const sizeClass = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-10 w-10" : "h-9 w-9";
  const baseClass = "shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium";
  return (
    <div
      aria-hidden
      className={`${sizeClass} ${baseClass} ${className}`.trim()}
      title={title ?? id}
    >
      {labelFromVaultId(id)}
    </div>
  );
}

