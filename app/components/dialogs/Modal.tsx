"use client";

import React, { PropsWithChildren, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title?: string;
  disableBackdropClose?: boolean;
  footer?: React.ReactNode;
  showClose?: boolean;
}>;

export function Modal({
  open,
  onClose,
  title,
  children,
  disableBackdropClose,
  footer,
  showClose = true,
}: ModalProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Lock body scroll and prevent layout shift when scrollbar disappears
    const body = typeof document !== "undefined" ? document.body : null;
    const prevOverflow = body?.style.overflow ?? "";
    const prevPaddingRight = body?.style.paddingRight ?? "";
    let adjusted = false;
    if (body) {
      const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarGap > 0) {
        body.style.paddingRight = `${scrollBarGap}px`;
        adjusted = true;
      }
      body.style.overflow = "hidden";
    }

    // Try to focus the scrollable content container for better keyboard nav
    const raf = requestAnimationFrame(() => {
      const root = scrollRef.current as HTMLElement | null;
      if (!root) return;
      const active = typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
      const alreadyInside = active ? root.contains(active) : false;
      if (alreadyInside) return;
      const firstFocusable = root.querySelector<HTMLElement>(
        'a[href], area[href], input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
      );
      (firstFocusable ?? root).focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(raf);
      if (body) {
        body.style.overflow = prevOverflow;
        if (adjusted) body.style.paddingRight = prevPaddingRight;
      }
    };
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
      <div className="relative z-10 w-full max-w-md max-h-modal rounded bg-surface shadow-lg flex flex-col mx-auto">
        <div className="flex items-center justify-between border-b border-foreground/10 p-4 shrink-0">
          <h2 id="modal-title" className="text-base font-medium truncate">
            {title ?? "Dialog"}
          </h2>
          {showClose && (
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
          )}
        </div>
        <div className="p-4 overflow-y-auto" tabIndex={0} ref={scrollRef}>
          {children}
        </div>
        {footer && (
          <div className="border-t border-foreground/10 p-3 text-right shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined" && document.body) {
    return createPortal(content, document.body);
  }
  return content;
}
