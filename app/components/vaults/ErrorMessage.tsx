"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";

export type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Card role="alert" className="max-w-xl mx-auto p-4">
      <p className="font-medium text-foreground">Error: <span className="font-normal">{message}</span></p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 px-3 h-8 rounded bg-primary text-primary-text hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary/40"
        >
          Retry
        </button>
      )}
    </Card>
  );
}
