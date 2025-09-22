"use client";

import React, { useMemo } from "react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { LabelValue } from "@/app/components/ui/LabelValue";
import { VaultIcon } from "@/app/components/vaults/VaultIcon";
import Link from "next/link";
import Big from "big.js";
import { formatMinimalTokenAmount } from "@/utils/format";
import { getTokenConfigById } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import type { PendingRequest } from "@/utils/data/pending";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { formatDurationFromSeconds } from "@/utils/time";
import { calculateApr } from "@/utils/finance";

type Props = {
  item: PendingRequest;
  factoryId: string;
};

export function PendingRequestCard({ item, factoryId }: Props) {
  const lr = item.liquidity_request;
  const network = networkFromFactoryId(factoryId);
  const tokenId = lr?.token ?? "";
  const registryCfg = tokenId ? getTokenConfigById(tokenId, network) : undefined;
  const { meta } = useTokenMetadata(tokenId);
  const decimals = (meta.decimals ?? registryCfg?.decimals ?? 6);
  const symbol = (meta.symbol ?? registryCfg?.symbol ?? "FT");
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

  const href = `/dashboard/vault/${encodeURIComponent(item.id)}`;
  return (
    <Link href={href} className="block group">
    <Card className="relative p-3 pr-8 hover:border-foreground/20 hover:bg-surface/60 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <VaultIcon id={item.id} size="md" />
          <div className="min-w-0">
            <div className="font-medium break-all" title={item.id}>{item.id}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <Badge variant="warn">Request open</Badge>
              <Badge variant="neutral">{symbol}</Badge>
            </div>
            {/* Owner hidden on pending request list */}
          </div>
        </div>
        {/* Right-side space reserved by pr-8; caret rendered absolutely */}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3">
        <LabelValue label="Amount" value={`${amountLabel} ${symbol}`} />
        <LabelValue label="Interest" value={`${interestLabel} ${symbol}`} />
        <LabelValue label="Repay" value={`${repayLabel} ${symbol}`} />
        <LabelValue label="Term" value={formatDurationFromSeconds(durationSeconds)} />
        <LabelValue label="Collateral" value={`${collateralNear} NEAR`} />
        <LabelValue label="Est. APR" value={aprLabel} />
      </div>
      {/* Centered caret indicator (absolute, non-interactive) */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="w-6 h-6 text-foreground opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
    </Link>
  );
}
