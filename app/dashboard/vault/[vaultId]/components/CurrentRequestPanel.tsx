"use client";

import React from "react";
import { formatDays } from "@/utils/time";
import { STRINGS } from "@/utils/strings";

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
    <section
      className="space-y-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-4"
      role="region"
      aria-label={STRINGS.currentRequestTitle}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text">{STRINGS.currentRequestTitle}</p>
        <p className="text-xs text-secondary-text">Snapshot of terms currently enforced on-chain.</p>
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
    </section>
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
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-secondary-text">{label}</div>
      <div className={`${mono ? "font-mono" : "font-semibold"} mt-1 break-all text-foreground`}>{value}</div>
      {detail && <div className="text-xs text-secondary-text">{detail}</div>}
    </div>
  );
}
