"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { Button } from "@/app/components/ui/Button";
import { getActiveNetwork } from "@/utils/networks";
import { getDefaultUsdcTokenId } from "@/utils/tokens";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { CopyButton } from "@/app/components/ui/CopyButton";

type Props = {
  open: boolean;
  onClose: () => void;
};

type TokenKind = "NEAR" | "USDC";

export function ReceiveValueDialog({ open, onClose }: Props) {
  const { signedAccountId } = useWalletSelector();
  const network = getActiveNetwork();
  const usdcId = useMemo(() => getDefaultUsdcTokenId(network), [network]);
  const LS_KEY = "lastAssetKind" as const;
  const [kind, setKind] = useState<TokenKind>(usdcId ? "USDC" : "NEAR");
  const [showToken, setShowToken] = useState(false);

  // Load last used kind on open
  useEffect(() => {
    if (!open) return;
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
      if (saved === "USDC" && usdcId) setKind("USDC");
      else if (saved === "NEAR") setKind("NEAR");
    } catch {}
  }, [open, usdcId]);

  // Persist selection
  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, kind);
    } catch {}
  }, [kind]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Receive ${kind}`}
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-5">
        <div className="text-xs text-secondary-text">Network: <span className="uppercase font-medium">{network}</span></div>

        {/* Asset toggle */}
        <div>
          <div className="text-sm text-secondary-text mb-1">Asset</div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="asset"
                value="NEAR"
                checked={kind === "NEAR"}
                onChange={() => setKind("NEAR")}
              />
              <span>NEAR</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="asset"
                value="USDC"
                checked={kind === "USDC"}
                onChange={() => setKind("USDC")}
                disabled={!usdcId}
              />
              <span>USDC{!usdcId ? " (unavailable)" : ""}</span>
            </label>
          </div>
        </div>

        {/* Focused content per asset */}
        {kind === "NEAR" ? (
          <section>
            <div className="text-sm font-medium mb-1">Receive NEAR (native)</div>
            <div className="flex items-center justify-between gap-2 rounded border bg-background px-3 h-10">
              <div className="truncate" title={signedAccountId ?? undefined}>{signedAccountId ?? "—"}</div>
              {signedAccountId && <CopyButton value={signedAccountId} title="Copy account" />}
            </div>
            <div className="mt-2 text-xs text-secondary-text">Share your account to receive NEAR.</div>
            <div className="mt-3 text-right">
              <CopyButton
                value={`Send NEAR to ${signedAccountId ?? 'my account'} on ${network.toUpperCase()}.`}
                title="Copy instructions"
              />
            </div>
          </section>
        ) : (
          <section>
            <div className="text-sm font-medium mb-2">Receive USDC</div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <div className="text-xs text-secondary-text mb-1">Receiver (your account)</div>
                <div className="flex items-center justify-between gap-2 rounded border bg-background px-3 h-10">
                  <div className="truncate" title={signedAccountId ?? undefined}>{signedAccountId ?? "—"}</div>
                  {signedAccountId && <CopyButton value={signedAccountId} title="Copy receiver" />}
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-secondary-text">
              Tell the sender: “Open wallet, choose USDC, paste my account into ‘To’, enter amount, confirm.” Do not send to the token contract.
            </div>
            <div className="mt-3">
              <button
                type="button"
                className="text-xs text-secondary-text hover:text-foreground underline"
                onClick={() => setShowToken((v) => !v)}
              >
                {showToken ? "Hide token contract" : "Show token contract"}
              </button>
            </div>
            {showToken && (
              <div className="mt-2 text-xs text-secondary-text space-y-2">
                <div>
                  Token contract ID:
                  <div className="mt-1 flex items-center justify-between gap-2 rounded border bg-background px-3 h-8">
                    <div className="truncate" title={usdcId ?? undefined}>{usdcId ?? "Not configured"}</div>
                    {usdcId && <CopyButton value={usdcId} title="Copy token id" />}
                  </div>
                </div>
                <div>
                  Wallets use ft_transfer under the hood (receiver_id is your account; attach 1 yoctoNEAR deposit).
                </div>
              </div>
            )}
            <div className="mt-3 text-right">
              <CopyButton
                value={`In your wallet, select USDC (${usdcId ?? 'token'}), send to ${signedAccountId ?? 'my account'} (receiver_id) on ${network.toUpperCase()}; include 1 yoctoNEAR deposit.`}
                title="Copy instructions"
              />
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}
