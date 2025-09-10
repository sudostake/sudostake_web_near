"use client";

import React from "react";

export function LoadingSpinner() {
  return (
    <div role="status" aria-live="polite" className="flex justify-center p-4">
      <span className="sr-only">Loading…</span>
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-zinc-400 border-t-transparent dark:border-zinc-500" />
    </div>
  );
}
