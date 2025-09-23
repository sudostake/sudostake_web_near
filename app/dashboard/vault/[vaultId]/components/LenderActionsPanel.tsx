"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { STRINGS, includesMaturedString } from "@/utils/strings";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { Button } from "@/app/components/ui/Button";

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
  return (
    <div className="mt-2 text-sm" aria-live="polite">
      {remainingMs !== null && remainingMs > 0 ? (
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="gap-2 w-full sm:w-auto"
          title="Available after expiry"
          disabled
          aria-disabled={true}
        >
          {`Start liquidation in ${formattedCountdown ?? "—"}`}
        </Button>
      ) : (
        <div className="rounded border border-foreground/10 bg-background p-3">
          <div className="text-sm font-medium mb-2">{STRINGS.nextPayoutSources}</div>
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-secondary-text">{STRINGS.availableNow}</div>
              <div className="font-medium">{claimableNowLabel} NEAR</div>
            </div>
            {!hasClaimableNow && (
              <div className="text-xs text-secondary-text">
                {STRINGS.nothingAvailableNow}
                {expectedNextLabel && (
                  <>
                    {" · "}{STRINGS.expectedNext}: {expectedNextLabel} NEAR
                  </>
                )}
              </div>
            )}
            {lenderId && (
              <div className="text-xs text-secondary-text">
                {STRINGS.payoutsGoTo} <span className="font-medium break-all" title={lenderId}>{lenderId}</span>
                <a
                  href={explorerAccountUrl(network, lenderId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline text-primary"
                >
                  {STRINGS.viewAccountOnExplorer}
                </a>
              </div>
            )}
            {processError && (
              <div className="text-xs text-red-600">{processError}</div>
            )}
            {maturedYocto > BigInt(0) && (
              <div className="text-xs text-secondary-text">
                {includesMaturedString(safeFormatYoctoNear(maturedYocto.toString(), 5))}
              </div>
            )}
            <Button
              type="button"
              variant="primary"
              size="md"
              className="gap-2 w-full sm:w-auto"
              onClick={onOpenProcess}
              disabled={processPending || !hasClaimableNow}
              title={!hasClaimableNow ? STRINGS.nothingAvailableNow : undefined}
            >
              {processPending ? STRINGS.processing : STRINGS.processAvailableNow}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
