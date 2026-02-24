"use client";

import React, { useMemo } from "react";
import { Card } from "@/app/components/ui/Card";
import { VaultIcon } from "@/app/components/vaults/VaultIcon";
import Link from "next/link";
import Big from "big.js";
import { formatMinimalTokenAmount } from "@/utils/format";
import { getTokenConfigById } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import type { PendingRequest } from "@/utils/data/pending";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { formatDurationFromSeconds } from "@/utils/time";
import { calculateApr } from "@/utils/finance";

type Props = {
  item: PendingRequest;
  factoryId: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
};

export function PendingRequestCard({ item, factoryId, tokenSymbol, tokenDecimals }: Props) {
  const lr = item.liquidity_request;
  const network = networkFromFactoryId(factoryId);
  const tokenId = lr?.token ?? "";
  const registryCfg = tokenId ? getTokenConfigById(tokenId, network) : undefined;
  const fallbackSymbol = tokenId.includes(".") ? tokenId.split(".")[0]?.toUpperCase() ?? tokenId : tokenId;
  const decimals = tokenDecimals ?? registryCfg?.decimals ?? 6;
  const symbol = tokenSymbol ?? registryCfg?.symbol ?? fallbackSymbol ?? "FT";
  const durationSeconds = lr?.duration ?? 0;

  const amountLabel = useMemo(() => (lr ? formatMinimalTokenAmount(lr.amount, decimals) : "—"), [lr, decimals]);
  const interestLabel = useMemo(() => (lr ? formatMinimalTokenAmount(lr.interest, decimals) : "—"), [lr, decimals]);
  const repayLabel = useMemo(() => {
    try {
      if (!lr) return "—";
      const totalRaw = new Big(lr.amount).plus(new Big(lr.interest)).toFixed(0);
      return formatMinimalTokenAmount(totalRaw, decimals);
    } catch { return "—"; }
  }, [lr, decimals]);
  const collateralNear = useMemo(() => (lr ? safeFormatYoctoNear(lr.collateral, 5) : "—"), [lr]);

  const aprLabel = useMemo(() => {
    try {
      if (!lr) return "—";
      const amount = new Big(lr.amount);
      if (amount.lte(0) || durationSeconds <= 0) return "—";
      const aprPct = calculateApr(lr.interest, lr.amount, durationSeconds).times(100);
      return `${aprPct.round(2, 0 /* RoundDown */).toString()}%`;
    } catch { return "—"; }
  }, [lr, durationSeconds]);
  const ownerLabel = useMemo(() => {
    if (!item.owner) return "Unknown owner";
    if (item.owner.length <= 22) return item.owner;
    return `${item.owner.slice(0, 9)}…${item.owner.slice(-8)}`;
  }, [item.owner]);

  const href = `/dashboard/vault/${encodeURIComponent(item.id)}`;
  if (!lr) return null;

  return (
    <Link href={href} className="block focus:outline-none" aria-label={`View vault details for ${item.id}`}>
      <Card className="group rounded-2xl p-4 sm:p-4 transition-colors duration-150 hover:border-foreground/25 hover:bg-[color:var(--surface-muted)] focus-visible:border-primary/40">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <VaultIcon id={item.id} size="md" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary-text">Vault</p>
                <p className="mt-1 break-all text-sm font-semibold text-foreground" title={item.id}>
                  {item.id}
                </p>
                <p className="mt-1 text-xs text-secondary-text">
                  Owner{" "}
                  <span className="font-mono text-foreground/90" title={item.owner ?? "Unknown owner"}>
                    {ownerLabel}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-text">
                {symbol}
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {aprLabel} APR
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
            <MetricCell label="Amount" value={`${amountLabel} ${symbol}`} />
            <MetricCell label="Interest" value={`${interestLabel} ${symbol}`} />
            <MetricCell label="Repay" value={`${repayLabel} ${symbol}`} />
            <MetricCell label="Term" value={formatDurationFromSeconds(durationSeconds)} />
            <MetricCell label="Collateral" value={`${collateralNear} NEAR`} />
            <MetricCell label="APR" value={aprLabel} />
          </div>

          <div className="flex items-center justify-between border-t border-[color:var(--border)] pt-3 text-xs">
            <p className="text-secondary-text">Open vault to review funding actions</p>
            <span className="font-medium text-primary transition group-hover:text-primary/80">Open vault</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-secondary-text">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
