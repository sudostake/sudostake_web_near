"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { LabelValue } from "@/app/components/ui/LabelValue";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { VaultIcon } from "@/app/components/vaults/VaultIcon";
import Link from "next/link";
import Big from "big.js";
import { formatMinimalTokenAmount } from "@/utils/format";
import { getTokenConfigById, getTokenDecimals } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { AcceptLiquidityConfirm } from "@/app/components/dialogs/AcceptLiquidityConfirm";
import { useAcceptLiquidityRequest } from "@/hooks/useAcceptLiquidityRequest";
import { useIndexVault } from "@/hooks/useIndexVault";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { useFtStorage } from "@/hooks/useFtStorage";
import { showToast } from "@/utils/toast";
import { getFriendlyErrorMessage } from "@/utils/errors";
import type { PendingRequest } from "@/utils/data/pending";
import { Button } from "@/app/components/ui/Button";
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
      const amount = new Big(lr.amount);
      const interest = new Big(lr.interest);
      const total = amount.plus(interest);
      const display = total.div(new Big(10).pow(decimals));
      // Reuse formatMinimalTokenAmount behavior via toFixed-like truncation
      // Keep 2-6 decimals depending on magnitude
      const s = display.lt(1) ? display.toFixed(6) : display.lt(1000) ? display.toFixed(3) : display.round(2, 0).toString();
      return s.replace(/\.0+$/, "");
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

  // Accept flow
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { acceptLiquidity, pending: accepting, error: acceptError } = useAcceptLiquidityRequest();
  const { indexVault } = useIndexVault();
  const { signedAccountId } = useWalletSelector();
  const { storageBalanceOf, storageBounds, registerStorage, pending: regPending } = useFtStorage();
  const [lenderRegistered, setLenderRegistered] = useState<boolean | null>(null);
  const [minDeposit, setMinDeposit] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!signedAccountId || !tokenId) { setLenderRegistered(null); setMinDeposit(null); return; }
      try {
        const bal = await storageBalanceOf(tokenId, signedAccountId);
        if (cancelled) return;
        const reg = bal !== null;
        setLenderRegistered(reg);
        if (!reg) {
          const bounds = await storageBounds(tokenId);
          if (cancelled) return;
          setMinDeposit(bounds?.min ?? null);
        } else {
          setMinDeposit(null);
        }
      } catch {
        if (!cancelled) { setLenderRegistered(null); setMinDeposit(null); }
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [signedAccountId, tokenId, storageBalanceOf, storageBounds]);

  const onRegister = async () => {
    if (!signedAccountId || !tokenId || !minDeposit) return;
    try {
      await registerStorage(tokenId, signedAccountId, minDeposit);
      const bal = await storageBalanceOf(tokenId, signedAccountId);
      setLenderRegistered(bal !== null);
      showToast("Registration successful", { variant: "success" });
    } catch (e) {
      showToast(getFriendlyErrorMessage(e), { variant: "error" });
    }
  };

  const onConfirmAccept = async () => {
    if (!lr || !item.id) return;
    try {
      const { txHash } = await acceptLiquidity({
        vault: item.id,
        token: lr.token,
        amount: lr.amount,
        interest: lr.interest,
        collateral: lr.collateral,
        duration: lr.duration,
      });
      showToast("Request accepted", { variant: "success" });
      setConfirmOpen(false);
      await indexVault({ factoryId, vault: item.id, txHash });
    } catch {
      // acceptError shows in dialog
    }
  };

  

  return (
    <Card className="p-3 hover:border-foreground/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <VaultIcon id={item.id} size="md" />
          <div className="min-w-0">
            <div className="font-medium truncate" title={item.id}>
              {item.id}
              <Badge variant="warn" className="ml-2">Request open</Badge>
              <Badge variant="neutral" className="ml-2">{symbol}</Badge>
            </div>
            {item.owner && (
              <div className="text-xs text-secondary-text truncate" title={item.owner}>Owner: {item.owner}</div>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          <CopyButton value={item.id} />
          <Link href={`/dashboard/vault/${encodeURIComponent(item.id)}`} className="text-xs underline text-primary ml-1">
            View
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3">
        <LabelValue label="Amount" value={`${amountLabel} ${symbol}`} />
        <LabelValue label="Interest" value={`${interestLabel} ${symbol}`} />
        <LabelValue label="Repay" value={`${repayLabel} ${symbol}`} />
        <LabelValue label="Term" value={formatDurationFromSeconds(durationSeconds)} />
        <LabelValue label="Collateral" value={`${collateralNear} NEAR`} />
        <LabelValue label="Est. APR" value={aprLabel} />
      </div>
      

      <div className="mt-3 flex items-center gap-2">
        <Button onClick={() => setConfirmOpen(true)} disabled={!lr || !signedAccountId}>
          Lend
        </Button>
        {!signedAccountId && (
          <div className="text-xs text-secondary-text">Connect to lend</div>
        )}
        {signedAccountId && lenderRegistered === false && (
          <>
            <Button variant="secondary" onClick={onRegister} disabled={regPending || !minDeposit}>
              {regPending ? "Registering…" : "Register to lend"}
            </Button>
            {minDeposit && (
              <div className="text-xs text-secondary-text">Requires ~{safeFormatYoctoNear(minDeposit, 5)} NEAR</div>
            )}
          </>
        )}
      </div>

      {lr && (
        <AcceptLiquidityConfirm
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={onConfirmAccept}
          pending={accepting}
          error={acceptError}
          vaultId={item.id}
          tokenId={lr.token}
          tokenSymbol={symbol}
          decimals={decimals}
          amountRaw={lr.amount}
          interestRaw={lr.interest}
          collateralYocto={lr.collateral}
          durationSeconds={durationSeconds}
        />
      )}
    </Card>
  );
}
