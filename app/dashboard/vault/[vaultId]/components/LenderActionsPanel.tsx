"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { STRINGS, includesMaturedString, startLiquidationInString } from "@/utils/strings";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";

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
      <Card className="space-y-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4" role="status" aria-live="polite">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">Lender actions</h3>
          <Badge variant="info">{formattedCountdown ?? "—"}</Badge>
        </div>
        <Button
          type="button"
          size="sm"
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
    <Card className="space-y-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4" aria-live="polite">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">Lender actions</h3>
        <Badge variant={hasClaimableNow ? "success" : "neutral"}>{claimableNowLabel} NEAR</Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Metric label={STRINGS.availableNow} value={`${claimableNowLabel} NEAR`} highlight={hasClaimableNow} />
        {expectedNextLabel ? (
          <Metric label={STRINGS.expectedNext} value={`${expectedNextLabel} NEAR`} />
        ) : (
          <Metric label={STRINGS.expectedNext} value="—" />
        )}
      </div>
      {lenderId && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-text">
          <span>{STRINGS.payoutsGoTo}</span>
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
        </div>
      )}
      {processError && (
        <p className="text-xs text-red-600" role="alert">{processError}</p>
      )}
      {maturedYocto > BigInt(0) && (
        <p className="text-xs text-secondary-text">{includesMaturedString(safeFormatYoctoNear(maturedYocto.toString(), 5))}</p>
      )}
      <Button
        type="button"
        onClick={onOpenProcess}
        disabled={processPending || !hasClaimableNow}
        size="sm"
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

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
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
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</div>
      <div className="mt-1 break-all font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}
