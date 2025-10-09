"use client";

import React from "react";
import { formatDays } from "@/utils/time";
import { STRINGS } from "@/utils/strings";
import { Card } from "@/app/components/ui/Card";

export type CurrentRequestContent = {
  token: string;
  amount: string;
  interest: string;
  totalDue: string;
  collateral: string;
  durationDays: number;
};

export function CurrentRequestPanel({
  content,
  active,
  showTimeline = false,
  countdownLabel,
  expiryLabel,
  expired = false,
}: {
  content: CurrentRequestContent;
  active: boolean;
  showTimeline?: boolean;
  countdownLabel?: string | null;
  expiryLabel?: string | null;
  expired?: boolean;
}) {
  const showExpiryField = Boolean(active && showTimeline && (expiryLabel || countdownLabel));
  const countdown = countdownLabel ?? null;
  const timelineValue = expiryLabel ?? (countdown ? STRINGS.loanDeadlineCountdown(String(countdown)) : "—");
  const timelineDetail = expiryLabel
    ? expired
      ? STRINGS.expiredLabel
      : countdown
      ? STRINGS.loanDeadlineCountdown(String(countdown))
      : null
    : expired
    ? STRINGS.expiredLabel
    : null;

  return (
    <Card className="space-y-4" role="region" aria-label={STRINGS.currentRequestTitle}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text">{STRINGS.currentRequestTitle}</p>
        <p className="text-sm text-secondary-text">Snapshot of the request terms lenders will evaluate.</p>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <Field label={STRINGS.tokenLabel} value={content.token} mono={false} />
        <Field label={STRINGS.amountLabel} value={content.amount} mono />
        <Field label={STRINGS.interestLabel} value={content.interest} mono />
        {active && <Field label={STRINGS.totalDue} value={content.totalDue} mono />}
        <Field label={STRINGS.collateralLabel} value={content.collateral} mono />
        <Field label={STRINGS.durationLabel} value={formatDays(content.durationDays)} />
        {showExpiryField && (
          <Field
            label={STRINGS.loanDeadlineLabel}
            value={timelineValue}
            detail={timelineDetail}
          />
        )}
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  mono = false,
  detail,
}: {
  label: string;
  value: string;
  mono?: boolean;
  detail?: string | null;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-secondary-text">{label}</div>
      <div className={`${mono ? "font-mono" : "font-medium"} break-all text-foreground`}>{value}</div>
      {detail && <div className="text-xs text-secondary-text">{detail}</div>}
    </div>
  );
}
