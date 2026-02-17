"use client";

import React, { useMemo } from "react";
import { Card } from "@/app/components/ui/Card";
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
    <Link href={href} className="block focus:outline-none" aria-label={`View vault details for ${item.id}`}>
      <Card className="flex flex-col gap-4 transition-colors duration-150 hover:border-foreground/25 focus-visible:border-primary/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <VaultIcon id={item.id} size="md" />
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text">Vault</p>
              <div className="break-all text-base font-semibold" title={item.id}>
                {item.id}
              </div>
              <p className="text-sm text-secondary-text">{symbol}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 text-sm text-secondary-text sm:grid-cols-2 xl:grid-cols-3">
          <LabelValue label="Amount" value={`${amountLabel} ${symbol}`} />
          <LabelValue label="Interest" value={`${interestLabel} ${symbol}`} />
          <LabelValue label="Repay" value={`${repayLabel} ${symbol}`} />
          <LabelValue label="Term" value={formatDurationFromSeconds(durationSeconds)} />
          <LabelValue label="Collateral" value={`${collateralNear} NEAR`} />
          <LabelValue label="Est. APR" value={aprLabel} />
        </div>
      </Card>
    </Link>
  );
}
