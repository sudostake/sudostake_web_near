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
    <Card role="alert" className="max-w-xl mx-auto p-4">
      <p className="font-medium text-foreground">Error: <span className="font-normal">{message}</span></p>
      {onRetry && (
        <Button className="mt-2" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Card>
  );
}
