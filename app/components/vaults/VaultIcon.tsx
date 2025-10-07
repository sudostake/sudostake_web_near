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

/**
 * Circular vault icon displaying a compact label derived from the vault ID.
 *
 * Size semantics map to Tailwind dimensions:
 * - "sm" → h-8 w-8
 * - "md" → h-9 w-9 (default)
 * - "lg" → h-10 w-10
 *
 * Accessibility: The icon is decorative and marked `aria-hidden` because the
 * adjacent UI already presents the full vault ID textually; this avoids
 * duplicate announcements for screen readers.
 */
export function VaultIcon({ id, size = "md", className = "", title }: Props) {
  const sizeClass = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-10 w-10" : "h-9 w-9";
  const baseClass = "shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium";
  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} ${baseClass} ${className}`.trim()}
      title={title ?? id}
    >
      {labelFromVaultId(id)}
    </div>
  );
}
