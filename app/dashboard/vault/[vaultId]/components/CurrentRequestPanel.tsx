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
}: {
  content: CurrentRequestContent;
  active: boolean;
}) {
  return (
    <div className="mt-4 rounded border border-foreground/10 p-3 bg-background" role="region" aria-label={STRINGS.currentRequestTitle}>
      <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.currentRequestTitle}</div>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.tokenLabel}</div>
          <div className="font-medium break-all" title={content.token}>{content.token}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.amountLabel}</div>
          <div className="font-mono">{content.amount}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.interestLabel}</div>
          <div className="font-mono">{content.interest}</div>
        </div>
        {active && (
          <div>
            <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.totalDue}</div>
            <div className="font-mono">{content.totalDue}</div>
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.collateralLabel}</div>
          <div className="font-mono">{content.collateral}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.durationLabel}</div>
          <div className="font-medium">{formatDays(content.durationDays)}</div>
        </div>
      </div>
    </div>
  );
}
