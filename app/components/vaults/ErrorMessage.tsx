"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

export type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Card role="alert" className="mx-auto max-w-xl space-y-3">
      <p className="text-sm text-red-600">
        <span className="font-semibold">Error:</span> {message}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="w-full sm:w-auto">
          Retry
        </Button>
      )}
    </Card>
  );
}
