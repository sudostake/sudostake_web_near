"use client";

import React, { PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";

export type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title?: string;
  disableBackdropClose?: boolean;
  footer?: React.ReactNode;
}>;

export function Modal({
  open,
  onClose,
  title,
  children,
  disableBackdropClose,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={disableBackdropClose ? undefined : onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-foreground/10 p-4">
          <h2 id="modal-title" className="text-base font-medium truncate">
            {title ?? "Dialog"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-foreground/10"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="border-t border-foreground/10 p-3 text-right">{footer}</div>}
      </div>
    </div>
  );

  if (typeof document !== "undefined" && document.body) {
    return createPortal(content, document.body);
  }
  return content;
}
