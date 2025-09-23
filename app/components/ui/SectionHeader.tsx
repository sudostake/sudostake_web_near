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
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {caption && (
          <div className="text-sm text-secondary-text mt-1">{caption}</div>
        )}
      </div>
      {right && <div className="mt-2 sm:mt-0 w-full sm:flex-1 sm:ml-4">{right}</div>}
    </div>
  );
}
