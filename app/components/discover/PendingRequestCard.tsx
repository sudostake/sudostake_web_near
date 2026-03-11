"use client";

import React, { useMemo } from "react";
import { Card } from "@/app/components/ui/Card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Big from "big.js";
import { formatMinimalTokenAmount } from "@/utils/format";
import { getTokenConfigById } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import type { PendingRequest } from "@/utils/data/pending";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { formatDurationWords } from "@/utils/time";
import { calculateApr } from "@/utils/finance";
import { buildVaultHref } from "@/app/components/navigationRoutes";

type Props = {
  item: PendingRequest;
  factoryId: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
};

export function PendingRequestCard({ item, factoryId, tokenSymbol, tokenDecimals }: Props) {
  const pathname = usePathname();
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
    if (!item.owner) return "Unknown borrower";
    if (item.owner.length <= 22) return item.owner;
    return `${item.owner.slice(0, 9)}…${item.owner.slice(-8)}`;
  }, [item.owner]);

  const amountDisplay = `${amountLabel} ${symbol}`;
  const repayDisplay = repayLabel === "—" ? "Unavailable" : `${repayLabel} ${symbol}`;
  const durationDisplay = formatDurationWords(durationSeconds);
  const collateralDisplay = `${collateralNear} NEAR`;
  const href = buildVaultHref(item.id, pathname);
  if (!lr) return null;

  return (
    <Link
      href={href}
      className="block focus:outline-none"
      aria-label={`Review opportunity to lend ${amountDisplay} and receive ${repayDisplay} back in ${durationDisplay}`}
    >
      <Card className="group rounded-app-lg border-2 p-4 transition-colors duration-150 hover:border-foreground/25 focus-visible:border-primary/40 sm:p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-lg font-semibold text-foreground">Lend {amountDisplay}</p>
              <p className="text-sm text-secondary-text">Repay {repayDisplay} in {durationDisplay}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.08em] text-secondary-text">APR</p>
              <p className="font-mono text-sm font-semibold text-foreground">{aprLabel}</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <DetailRow
              label="Borrower"
              value={ownerLabel}
              title={item.owner ?? "Unknown borrower"}
              mono
            />
            <DetailRow label="Collateral" value={collateralDisplay} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function DetailRow({
  label,
  value,
  title,
  mono = false,
}: {
  label: string;
  value: string;
  title?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.08em] text-secondary-text">{label}</p>
      <p
        className={[
          "text-sm text-foreground",
          mono ? "break-all font-mono" : "break-words font-semibold",
        ].join(" ")}
        title={title ?? value}
      >
        {value}
      </p>
    </div>
  );
}
