"use client";

import React from "react";
import { STRINGS } from "@/utils/strings";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { startLiquidationInString } from "@/utils/strings";

type Props = {
  onRepay: () => void;
  onBeginLiquidation: () => void;
  remainingMs: number | null;
  formattedCountdown: string | null;
  expiryLabel?: string | null;
};

export function OwnerActionsPanel({ onRepay, onBeginLiquidation, remainingMs, formattedCountdown, expiryLabel }: Props) {
  const hasCountdown = typeof remainingMs === "number" && remainingMs > 0;
  const hasExpired = typeof remainingMs === "number" && remainingMs === 0;
  const canStartLiquidation = hasExpired;
  const showTiming = hasCountdown || hasExpired || Boolean(expiryLabel);
  const countdownDisplay = formattedCountdown ?? "—";

  return (
    <Card className="space-y-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4" role="region" aria-label="Owner actions">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">Owner actions</h3>
        {(hasCountdown || hasExpired) && (
          <Badge variant={hasExpired ? "warn" : "info"}>
            {hasExpired ? STRINGS.ownerLoanTermEnded : countdownDisplay}
          </Badge>
        )}
      </div>

      {showTiming && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${
            hasExpired ? "border-amber-200/60 bg-amber-50/80 text-amber-800" : "border-primary/20 bg-primary/5 text-secondary-text"
          }`}
          role="status"
          aria-live="polite"
        >
          {expiryLabel ? expiryLabel : hasExpired ? STRINGS.expiredRepayWarning : STRINGS.ownerRepayCountdownHint}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={onRepay} size="sm" className="w-full gap-2 sm:w-auto">
          {STRINGS.ownerRepayNow}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onBeginLiquidation}
          disabled={!canStartLiquidation}
          size="sm"
          className="w-full gap-2 sm:w-auto"
          title={hasCountdown ? startLiquidationInString(String(countdownDisplay)) : undefined}
        >
          {hasCountdown ? startLiquidationInString(String(countdownDisplay)) : STRINGS.beginLiquidation}
        </Button>
      </div>
    </Card>
  );
}
