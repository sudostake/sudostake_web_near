"use client";

import React from "react";

type SkipLinkProps = {
  targetId?: string;
};

export function SkipLink({ targetId = "main" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only fixed left-3 top-3 z-[60] rounded bg-primary px-3 py-2 text-primary-text shadow focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      Skip to main content
    </a>
  );
}
