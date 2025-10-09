"use client";

import React from "react";
import { STRINGS } from "@/utils/strings";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";

type Props = {
  onRepay: () => void;
  remainingMs: number | null;
  formattedCountdown: string | null;
  expiryLabel?: string | null;
};

export function OwnerActionsPanel({ onRepay, remainingMs, formattedCountdown, expiryLabel }: Props) {
  const hasCountdown = typeof remainingMs === "number" && remainingMs > 0;
  const hasExpired = typeof remainingMs === "number" && remainingMs === 0;
  const showTiming = hasCountdown || hasExpired || Boolean(expiryLabel);
  const countdownDisplay = formattedCountdown ?? "—";

  return (
    <Card className="space-y-3" role="region" aria-label="Owner actions">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{STRINGS.ownerRepayNow}</h3>
        <p className="text-xs text-secondary-text">
          Repay the outstanding amount to unlock collateral and close the request.
        </p>
      </div>

      {showTiming && (
        <div
          className={`space-y-2 rounded-lg border px-3 py-3 text-xs ${
            hasExpired ? "border-amber-200/60 bg-amber-50/80 text-amber-800" : "border-primary/20 bg-primary/5 text-secondary-text"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-3">
            <Badge variant={hasExpired ? "warn" : "info"}>
              {hasExpired ? STRINGS.ownerLoanTermEnded : STRINGS.ownerLoanTermEndsSoon}
            </Badge>
            {(hasCountdown || hasExpired) && (
              <span
                className={`font-mono text-sm ${hasExpired ? "text-amber-800" : "text-primary"}`}
                aria-label={
                  hasExpired
                    ? STRINGS.ownerLoanTermEnded
                    : STRINGS.ownerLoanTermEndsIn(String(countdownDisplay))
                }
              >
                {hasExpired ? STRINGS.ownerLoanTermEnded : countdownDisplay}
              </span>
            )}
          </div>
          <p className="text-xs">
            {hasExpired ? STRINGS.expiredRepayWarning : STRINGS.ownerRepayCountdownHint}
          </p>
          {expiryLabel && (
            <div className="pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary-text">
                {STRINGS.ownerExactExpiryLabel}
              </span>
              <div className={`text-xs ${hasExpired ? "text-amber-800" : "text-foreground/80"}`}>{expiryLabel}</div>
            </div>
          )}
        </div>
      )}

      <Button type="button" onClick={onRepay} className="w-full gap-2 sm:w-auto">
        {STRINGS.ownerRepayNow}
      </Button>
    </Card>
  );
}
