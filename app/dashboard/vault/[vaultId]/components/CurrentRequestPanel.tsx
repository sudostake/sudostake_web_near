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

type FieldProps = {
  label: string;
  value: string;
  emphasize?: boolean;
  mono?: boolean;
};

function Field({ label, value, emphasize = false, mono = false }: FieldProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</div>
      <div
        className={[
          mono ? "font-mono" : "font-medium",
          emphasize ? "text-lg" : "text-sm",
          "break-all text-foreground",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

export function CurrentRequestPanel({
  content,
  active,
  showTimeline = false,
  countdownLabel,
  expiryLabel,
  expired = false,
  flat = false,
}: {
  content: CurrentRequestContent;
  active: boolean;
  showTimeline?: boolean;
  countdownLabel?: string | null;
  expiryLabel?: string | null;
  expired?: boolean;
  flat?: boolean;
}) {
  const showExpiryField = Boolean(active && showTimeline && (expiryLabel || countdownLabel));
  const countdown = countdownLabel ?? null;
  const timelineValue = expired
    ? expiryLabel ?? STRINGS.expiredLabel
    : expiryLabel ?? (countdown ? STRINGS.loanDeadlineCountdown(String(countdown)) : "—");

  const leadFields = [
    active
      ? { label: STRINGS.totalDue, value: content.totalDue, emphasize: true }
      : { label: STRINGS.amountLabel, value: content.amount, emphasize: true },
    { label: STRINGS.collateralLabel, value: content.collateral, emphasize: true },
    {
      label: showExpiryField ? STRINGS.loanDeadlineLabel : STRINGS.durationLabel,
      value: showExpiryField ? timelineValue : formatDays(content.durationDays),
      emphasize: true,
    },
  ];

  const detailFields = [
    { label: STRINGS.tokenLabel, value: content.token },
    !active
      ? { label: STRINGS.totalDue, value: content.totalDue }
      : { label: STRINGS.amountLabel, value: content.amount },
    { label: STRINGS.interestLabel, value: content.interest },
  ];

  return (
    <section
      className={[
        "space-y-5",
        flat ? "" : "rounded-app border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 sm:px-5",
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-label={STRINGS.currentRequestTitle}
    >
      {!flat && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          {STRINGS.currentRequestTitle}
        </p>
      )}

      <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
        {leadFields.map((field) => (
          <Field
            key={field.label}
            label={field.label}
            value={field.value}
            emphasize={field.emphasize}
            mono
          />
        ))}
      </div>

      <div className="border-t border-foreground/10 pt-4">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
          {detailFields.map((field) => (
            <Field key={field.label} label={field.label} value={field.value} mono={field.label !== STRINGS.tokenLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}
