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
}: {
  content: CurrentRequestContent;
  active: boolean;
}) {
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
      </div>
    </Card>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-secondary-text">{label}</div>
      <div className={`${mono ? "font-mono" : "font-medium"} break-all text-foreground`}>{value}</div>
    </div>
  );
}
