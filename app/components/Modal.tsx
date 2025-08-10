"use client";

import React, { PropsWithChildren } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  disableBackdropClose,
}: PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title?: string;
  disableBackdropClose?: boolean;
}>) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={disableBackdropClose ? undefined : onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-lg bg-surface shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
