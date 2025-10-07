"use client";

import React from "react";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { STRINGS } from "@/utils/strings";
import { Card } from "@/app/components/ui/Card";

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
  showBreakdownHint = true,
}: Props) {
  return (
    <Card className="space-y-3 text-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <div className="text-secondary-text">{STRINGS.paidSoFar}</div>
          <div className="font-medium">{safeFormatYoctoNear(paidSoFarYocto, 5)} NEAR</div>
        </div>
        {expectedImmediateLabel && (
          <div>
            <div className="text-secondary-text">{STRINGS.availableNow}</div>
            <div className="font-medium">{expectedImmediateLabel} NEAR</div>
          </div>
        )}
        <div>
          <div className="text-secondary-text">{remainingLabel ? STRINGS.remainingLabel : STRINGS.expectedNext}</div>
          <div className="font-medium">{(remainingLabel ?? expectedNextLabel ?? "0")} NEAR</div>
        </div>
      </div>
      {showBreakdownHint && (maturedTotalLabel || unbondingTotalLabel) && (
        <div className="text-xs text-secondary-text">
          {maturedTotalLabel ? `Includes ${maturedTotalLabel} NEAR matured` : ""}
          {maturedTotalLabel && unbondingTotalLabel ? " · " : ""}
          {unbondingTotalLabel ? `Unbonding ${unbondingTotalLabel} NEAR` : ""}
        </div>
      )}
      {showPayoutNote && lenderId && (
        <div className="text-xs text-secondary-text">
          {STRINGS.payoutsGoTo}{" "}
          <span className="font-medium break-all" title={lenderId}>{lenderId}</span>
          {lenderUrl && (
            <a href={lenderUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-primary">
              {STRINGS.viewAccountOnExplorer}
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
