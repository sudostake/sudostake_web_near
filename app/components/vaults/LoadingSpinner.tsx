"use client";

import React from "react";

export function LoadingSpinner() {
  return (
    <div role="status" aria-label="Loading vaults…" className="flex justify-center p-4">
      <div className="animate-spin h-8 w-8 border-4 border-current border-t-transparent rounded-full" />
    </div>
  );
}
