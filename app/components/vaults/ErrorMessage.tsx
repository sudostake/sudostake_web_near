"use client";

import React, { useEffect } from "react";
import { Card } from "@/app/components/ui/Card";

export type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  useEffect(() => {
    if (!onRetry) return;
    const timer = window.setTimeout(() => {
      onRetry();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [onRetry]);

  return (
    <Card role="alert" className="mx-auto max-w-xl space-y-3">
      <p className="text-sm text-red-600">
        <span className="font-semibold">Error:</span> {message}
      </p>
      {onRetry && (
        <p className="text-xs font-medium uppercase tracking-wide text-red-600/70">
          Retrying automatically…
        </p>
      )}
    </Card>
  );
}
