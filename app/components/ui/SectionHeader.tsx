"use client";

import React from "react";

type Props = {
  title: React.ReactNode;
  caption?: React.ReactNode;
  right?: React.ReactNode; // optional right-aligned actions
  className?: string;
};

export function SectionHeader({ title, caption, right, className = "" }: Props) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {caption && <p className="text-sm text-secondary-text">{caption}</p>}
      </div>
      {right && <div className="sm:ml-6 sm:flex-1">{right}</div>}
    </div>
  );
}
