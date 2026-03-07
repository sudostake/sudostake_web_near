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
  const timelineValue = expired
    ? expiryLabel ?? STRINGS.expiredLabel
    : expiryLabel ?? (countdown ? STRINGS.loanDeadlineCountdown(String(countdown)) : "—");
  const leadFields = [
    active
      ? { label: STRINGS.totalDue, value: content.totalDue, highlight: true }
      : { label: STRINGS.amountLabel, value: content.amount, highlight: true },
    { label: STRINGS.collateralLabel, value: content.collateral, highlight: true },
    {
      label: showExpiryField ? STRINGS.loanDeadlineLabel : STRINGS.durationLabel,
      value: showExpiryField ? timelineValue : formatDays(content.durationDays),
      highlight: true,
    },
  ];
  const detailFields = [
    { label: STRINGS.tokenLabel, value: content.token, mono: false },
    !active ? { label: STRINGS.totalDue, value: content.totalDue } : { label: STRINGS.amountLabel, value: content.amount },
    { label: STRINGS.interestLabel, value: content.interest },
  ];

  return (
    <section
      className="space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-4"
      role="region"
      aria-label={STRINGS.currentRequestTitle}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">{STRINGS.currentRequestTitle}</p>
      <div className="grid gap-2 md:grid-cols-3">
        {leadFields.map((field) => (
          <Field key={field.label} label={field.label} value={field.value} mono highlight={field.highlight} />
        ))}
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-3">
        {detailFields.map((field) => (
          <Field key={field.label} label={field.label} value={field.value} mono={field.mono ?? true} />
        ))}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border px-3 py-3",
        highlight
          ? "border-primary/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_10%,var(--surface)),var(--surface))]"
          : "border-[color:var(--border)] bg-[color:var(--surface)]",
      ].join(" ")}
    >
      <div className="text-xs uppercase tracking-[0.18em] text-secondary-text">{label}</div>
      <div className={`${mono ? "font-mono" : "font-semibold"} mt-1 break-all text-foreground`}>{value}</div>
    </div>
  );
}
