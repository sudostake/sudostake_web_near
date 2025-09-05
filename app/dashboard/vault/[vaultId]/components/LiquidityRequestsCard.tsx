"use client";

import React, { useMemo, useState } from "react";
import { RequestLiquidityDialog } from "@/app/components/dialogs/RequestLiquidityDialog";
import { useVault } from "@/hooks/useVault";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getTokenConfigById, getTokenDecimals } from "@/utils/tokens";
import { utils } from "near-api-js";

type Props = { vaultId: string; factoryId: string };

function formatTokenAmount(minimal: string, tokenId: string): string {
  const cfg = getTokenConfigById(tokenId);
  const decimals = cfg?.decimals ?? getTokenDecimals(tokenId);
  const sym = cfg?.symbol ?? "FT";
  // Avoid big.js here to keep this lightweight; format by padding and inserting decimal point
  const s = minimal.replace(/^0+/, "");
  const d = Math.max(0, decimals);
  const pad = s.length <= d ? "0".repeat(d - s.length + 1) + s : s;
  const i = pad.length - d;
  const withDot = d === 0 ? pad : `${pad.slice(0, i)}.${pad.slice(i)}`;
  const cleaned = withDot.replace(/^0+(\d)/, "$1").replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  return `${cleaned} ${sym}`;
}

export function LiquidityRequestsCard({ vaultId, factoryId }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const { data, loading, error, refetch } = useVault(factoryId, vaultId);
  const { indexVault } = useIndexVault();

  const content = useMemo(() => {
    const req = data?.liquidity_request;
    if (!req) return null;
    const amount = formatTokenAmount(req.amount, req.token);
    const interest = formatTokenAmount(req.interest, req.token);
    const collateral = `${utils.format.formatNearAmount(req.collateral)} NEAR`;
    const durationDays = Math.max(1, Math.round((req.duration ?? 0) / 86400));
    return { amount, interest, collateral, durationDays, token: req.token };
  }, [data]);

  const openDisabled = Boolean(data?.state === "pending" || data?.state === "active");
  const hasOpenRequest = Boolean(content);

  // Stubbed cancel action — to be implemented in next PR.
  const onCancel = async () => {
    // Placeholder: intentionally no-op for this release.
    return;
  };

  return (
    <section className="rounded border bg-surface p-4">
      <div className="flex items-center gap-4">
        <div className="coin-scene">
          <div className="coin" aria-hidden="true">
            <div className="face front" />
            <div className="face back" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {hasOpenRequest ? (
            <>
              <div className="text-base font-medium truncate">Your liquidity request</div>
              <div className="mt-1 text-sm text-secondary-text">You can cancel before an offer is accepted.</div>
            </>
          ) : (
            <>
              <div className="text-base font-medium truncate">Access USDC backed by your staked tokens</div>
              <div className="mt-1 text-sm text-secondary-text">Open a request for USDC using your vault as collateral.</div>
            </>
          )}
        </div>
        {!hasOpenRequest && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setOpenDialog(true)}
              disabled={openDisabled}
              className="inline-flex items-center gap-2 px-3 h-9 rounded border bg-surface hover:bg-surface/90 disabled:opacity-50"
            >
              Open request
            </button>
          </div>
        )}
      </div>

      {content && (
        <div className="mt-4 rounded border border-foreground/10 p-3 bg-background">
          <div className="text-sm text-secondary-text">Current request</div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-secondary-text">Token</div>
              <div className="font-medium truncate" title={content.token}>{content.token}</div>
            </div>
            <div>
              <div className="text-secondary-text">Amount</div>
              <div className="font-medium">{content.amount}</div>
            </div>
            <div>
              <div className="text-secondary-text">Interest</div>
              <div className="font-medium">{content.interest}</div>
            </div>
            <div>
              <div className="text-secondary-text">Collateral</div>
              <div className="font-medium">{content.collateral}</div>
            </div>
            <div>
              <div className="text-secondary-text">Duration</div>
              <div className="font-medium">{content.durationDays} days</div>
            </div>
          </div>
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={onCancel}
              disabled={true}
              title="Cancel will be available in the next update"
              className="inline-flex items-center gap-2 px-3 h-9 rounded border bg-surface disabled:opacity-50"
            >
              Cancel request (soon)
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .coin-scene { width: 48px; height: 48px; perspective: 800px; }
        .coin { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; animation: coin-spin 12s linear infinite; will-change: transform; }
        .face { position: absolute; inset: 0; background-size: cover; background-position: center; border-radius: 50%; backface-visibility: hidden; }
        .front { background-image: url('/usdc.png'); }
        .back { background-image: url('/near.svg'); transform: rotateY(180deg); }
        @keyframes coin-spin { 0% { transform: rotateX(6deg) rotateY(0deg);} 50% { transform: rotateX(6deg) rotateY(180deg);} 100% { transform: rotateX(6deg) rotateY(360deg);} }
      `}</style>
      <RequestLiquidityDialog open={openDialog} onClose={() => setOpenDialog(false)} vaultId={vaultId} />
    </section>
  );
}
