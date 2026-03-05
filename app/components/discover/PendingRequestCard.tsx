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
      <Card className="group rounded-2xl p-4 transition-colors duration-150 hover:border-foreground/25 focus-visible:border-primary/40">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <VaultIcon id={item.id} size="md" />
              <div className="min-w-0">
                <p className="break-all text-sm font-semibold text-foreground" title={item.id}>
                  {item.id}
                </p>
                <p className="mt-1 text-xs text-secondary-text">
                  Owner{" "}
                  <span className="font-mono text-foreground" title={item.owner ?? "Unknown owner"}>
                    {ownerLabel}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:shrink-0 sm:flex-col sm:items-end sm:gap-0 sm:text-right">
              <p className="text-xs text-secondary-text">{symbol}</p>
              <p className="text-sm font-semibold text-foreground">{aprLabel} APR</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <MetricItem label="Amount" value={`${amountLabel} ${symbol}`} />
            <MetricItem label="Repay" value={`${repayLabel} ${symbol}`} />
            <MetricItem label="Term" value={formatDurationFromSeconds(durationSeconds)} />
            <MetricItem label="Collateral" value={`${collateralNear} NEAR`} />
          </div>

          <span className="inline-flex text-xs font-medium text-primary transition group-hover:text-primary">View details</span>
        </div>
      </Card>
    </Link>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary-text">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-foreground" title={value}>{value}</p>
    </div>
  );
}
