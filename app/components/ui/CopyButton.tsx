"use client";

import React from "react";
import { showToast } from "@/utils/toast";
import { STRINGS } from "@/utils/strings";
import { VisuallyHidden } from "./VisuallyHidden";

type Props = {
  value: string;
  className?: string;
  size?: number; // px for icon dimensions
  title?: string;
};

export function CopyButton({ value, className = "", size = 16, title }: Props) {
  const [status, setStatus] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<number | null>(null);

  const onCopy = React.useCallback(() => {
    try {
      navigator.clipboard?.writeText(String(value));
      showToast(STRINGS.copied);
      setStatus(STRINGS.copied);
    } catch {
      showToast(STRINGS.copyFailed, { variant: "error" });
      setStatus(STRINGS.copyFailed);
    }
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setStatus(null), 1500);
  }, [value]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label={title ?? STRINGS.copy}
      title={title ?? STRINGS.copy}
      onClick={onCopy}
      className={`inline-flex items-center justify-center h-5 w-5 rounded hover:bg-surface/70 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-80" style={{ width: size, height: size }} aria-hidden="true">
        <path d="M16 1H6a2 2 0 0 0-2 2v10h2V3h10V1z"/>
        <path d="M18 5H10a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 14H10V7h8v12z"/>
      </svg>
      <VisuallyHidden role="status" aria-live="polite">{status ?? ""}</VisuallyHidden>
    </button>
  );
}
