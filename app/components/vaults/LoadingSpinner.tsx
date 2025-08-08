"use client";

import React from "react";

export function LoadingSpinner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex justify-center p-4"
    >
      <span className="sr-only">Loading vaults…</span>
      <div className="animate-spin h-8 w-8 border-4 border-current border-t-transparent rounded-full" />
    </div>
  );
}
