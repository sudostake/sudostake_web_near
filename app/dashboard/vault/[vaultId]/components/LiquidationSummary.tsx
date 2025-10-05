"use client";

import React from "react";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { STRINGS } from "@/utils/strings";

type Props = {
  paidSoFarYocto: string | number | bigint;
  expectedNextLabel?: string | null;
  expectedImmediateLabel?: string | null;
  maturedTotalLabel?: string | null;
  unbondingTotalLabel?: string | null;
  showPayoutNote?: boolean;
  lenderId?: string | null;
  lenderUrl?: string | null;
  remainingLabel?: string | null;
  compactLabels?: boolean;
  unitLabel?: string | null;
  showBreakdownHint?: boolean;
};

export function LiquidationSummary({
  paidSoFarYocto,
  expectedNextLabel,
  expectedImmediateLabel,
  maturedTotalLabel,
  unbondingTotalLabel,
  showPayoutNote,
  lenderId,
  lenderUrl,
  remainingLabel,
  compactLabels = false,
  unitLabel = null,
  showBreakdownHint = true,
}: Props) {
  const paidLabel = compactLabels ? STRINGS.paidShort : STRINGS.paidSoFar;
  const nowLabel = compactLabels ? STRINGS.nowShort : STRINGS.availableNow;
  const nextLabel = compactLabels ? STRINGS.nextShort : (remainingLabel ? STRINGS.remainingLabel : STRINGS.expectedNext);
  const withUnit = (val: string) => (unitLabel ? val : `${val} NEAR`);
  return (
    <div className="relative mt-2 rounded border border-foreground/20 bg-background/80 p-3 text-foreground dark:bg-background/60 text-sm">
      {unitLabel && (
        <div className="absolute right-3 top-2 text-xs text-secondary-text">{unitLabel}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <div className="text-secondary-text">{paidLabel}</div>
          <div className="font-medium">{withUnit(safeFormatYoctoNear(paidSoFarYocto, 5))}</div>
        </div>
        {expectedImmediateLabel && (
          <div>
            <div className="text-secondary-text">{nowLabel}</div>
            <div className="font-medium">{withUnit(expectedImmediateLabel)}</div>
          </div>
        )}
        <div>
          <div className="text-secondary-text">{nextLabel}</div>
          <div className="font-medium">{withUnit(remainingLabel ?? expectedNextLabel ?? "0")}</div>
        </div>
      </div>
      {showBreakdownHint && (maturedTotalLabel || unbondingTotalLabel) && (
        <div className="mt-1 text-xs text-secondary-text">
          {maturedTotalLabel ? `Includes ${unitLabel ? maturedTotalLabel : `${maturedTotalLabel} NEAR`} matured` : ""}
          {maturedTotalLabel && unbondingTotalLabel ? " · " : ""}
          {unbondingTotalLabel ? `Unbonding ${unitLabel ? unbondingTotalLabel : `${unbondingTotalLabel} NEAR`}` : ""}
        </div>
      )}
      {showPayoutNote && lenderId && (
        <div className="mt-1 text-xs text-secondary-text">
          {STRINGS.payoutsGoTo}{" "}
          <span className="font-medium break-all" title={lenderId}>{lenderId}</span>
          {lenderUrl && (
            <a href={lenderUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-primary">
              {STRINGS.viewAccountOnExplorer}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
