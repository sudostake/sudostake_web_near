"use client";

import React from "react";

type FlatSectionProps = React.PropsWithChildren<{
  title: React.ReactNode;
  caption?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}>;

export function FlatSection({
  title,
  caption,
  actions,
  className = "",
  contentClassName = "space-y-4 px-4 py-5 sm:px-5 sm:py-6",
  children,
}: FlatSectionProps) {
  return (
    <section
      className={`overflow-hidden rounded-app-lg border-2 border-[color:var(--border)] bg-[color:var(--surface)] ${className}`}
    >
      <div className="border-b-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {caption ? <p className="max-w-3xl text-sm text-secondary-text">{caption}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
