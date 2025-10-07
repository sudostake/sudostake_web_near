"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { STRINGS, includesMaturedString, startLiquidationInString } from "@/utils/strings";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

type Props = {
  remainingMs: number | null;
  formattedCountdown: string | null;
  hasClaimableNow: boolean;
  claimableNowLabel: string;
  expectedNextLabel?: string | null;
  lenderId?: string | null;
  network: Network;
  processError?: string | null;
  processPending: boolean;
  maturedYocto: bigint;
  onOpenProcess: () => void;
};

export function LenderActionsPanel({
  remainingMs,
  formattedCountdown,
  hasClaimableNow,
  claimableNowLabel,
  expectedNextLabel,
  lenderId,
  network,
  processError,
  processPending,
  maturedYocto,
  onOpenProcess,
}: Props) {
  if (remainingMs !== null && remainingMs > 0) {
    return (
      <Card className="space-y-3" role="status" aria-live="polite">
        <h3 className="text-sm font-semibold text-foreground">{STRINGS.nextPayoutSources}</h3>
        <p className="text-sm text-secondary-text">{STRINGS.availableAfterExpiry}</p>
        <Button
          type="button"
          className="w-full justify-center gap-2"
          disabled
          aria-disabled
        >
          {startLiquidationInString(String(formattedCountdown ?? "—"))}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-3" aria-live="polite">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{STRINGS.nextPayoutSources}</h3>
        <p className="text-xs text-secondary-text">See what’s available to claim right now and how much is queued.</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-secondary-text">{STRINGS.availableNow}</span>
        <span className="font-semibold">{claimableNowLabel} NEAR</span>
      </div>
      {!hasClaimableNow && (
        <p className="text-xs text-secondary-text">
          {STRINGS.nothingAvailableNow}
          {expectedNextLabel && (
            <>
              {" · "}
              {STRINGS.expectedNext}: {expectedNextLabel} NEAR
            </>
          )}
        </p>
      )}
      {lenderId && (
        <p className="text-xs text-secondary-text">
          {STRINGS.payoutsGoTo}{" "}
          <span className="font-medium break-all" title={lenderId}>{lenderId}</span>
          <a
            href={explorerAccountUrl(network, lenderId)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-primary underline"
            aria-label={`View lender ${lenderId} on explorer`}
          >
            {STRINGS.viewAccountOnExplorer}
          </a>
        </p>
      )}
      {processError && (
        <p className="text-xs text-red-600" role="alert">{processError}</p>
      )}
      {maturedYocto > BigInt(0) && (
        <p className="text-xs text-secondary-text">
          {includesMaturedString(safeFormatYoctoNear(maturedYocto.toString(), 5))}
        </p>
      )}
      <Button
        type="button"
        onClick={onOpenProcess}
        disabled={processPending || !hasClaimableNow}
        className="w-full justify-center gap-2"
        aria-busy={processPending ? true : undefined}
        title={!hasClaimableNow ? STRINGS.nothingAvailableNow : undefined}
      >
        {processPending ? STRINGS.processing : STRINGS.processAvailableNow}
      </Button>
      {processPending && (
        <div className="sr-only" role="status" aria-live="polite">
          {STRINGS.processing}
        </div>
      )}
    </Card>
  );
}
