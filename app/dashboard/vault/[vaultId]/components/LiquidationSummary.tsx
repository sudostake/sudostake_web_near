"use client";

import React from "react";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { STRINGS } from "@/utils/strings";

type Props = {
  paidSoFarYocto: string | number | bigint;
  expectedNextLabel?: string | null;
  showPayoutNote?: boolean;
  lenderId?: string | null;
  lenderUrl?: string | null;
};

export function LiquidationSummary({
  paidSoFarYocto,
  expectedNextLabel,
  showPayoutNote,
  lenderId,
  lenderUrl,
}: Props) {
  return (
    <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
      <div className="rounded border border-foreground/20 bg-background/80 p-2 text-foreground dark:bg-background/60">
        <div className="text-secondary-text">{STRINGS.paidSoFar}</div>
        <div className="font-medium">{safeFormatYoctoNear(paidSoFarYocto)} NEAR</div>
      </div>
      <div className="rounded border border-foreground/20 bg-background/80 p-2 text-foreground dark:bg-background/60">
        <div className="text-secondary-text">{STRINGS.expectedNext}</div>
        <div className="font-medium">{expectedNextLabel ?? "0"} NEAR</div>
        {showPayoutNote && lenderId && (
          <div className="text-xs text-secondary-text mt-0.5">
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
    </div>
  );
}
