"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Modal } from "@/app/components/dialogs/Modal";
import { AssetToggle } from "@/app/components/ui/AssetToggle";
import { Button } from "@/app/components/ui/Button";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { getActiveNetwork, type Network } from "@/utils/networks";
import { STORAGE_KEY_SEND_ASSET_KIND } from "@/utils/storageKeys";
import { getDefaultUsdcTokenId } from "@/utils/tokens";

type Props = {
  open: boolean;
  onClose: () => void;
};

type TokenKind = "NEAR" | "USDC";

type AddRoute = {
  title: string;
  description: string;
  destinationLabel: string;
  href: string;
  ctaLabel: string;
  instruction: string;
};

function getAddRoute(network: Network, kind: TokenKind, signedAccountId: string | null): AddRoute {
  if (network === "testnet") {
    if (kind === "USDC") {
      return {
        title: "Get testnet USDC",
        description: "Use Circle's official faucet to mint testnet USDC, then send it to your wallet account.",
        destinationLabel: "Circle Faucet",
        href: "https://faucet.circle.com",
        ctaLabel: "Open Circle faucet",
        instruction: `Open Circle Faucet and mint testnet USDC for ${signedAccountId ?? "your account"} on NEAR testnet.`,
      };
    }
    return {
      title: "Get testnet NEAR",
      description: "Use the official NEAR faucet docs to fund your wallet account with testnet NEAR.",
      destinationLabel: "NEAR Faucet Docs",
      href: "https://docs.near.org/faucet",
      ctaLabel: "Open NEAR faucet docs",
      instruction: `Follow NEAR faucet steps to add testnet NEAR to ${signedAccountId ?? "your account"}.`,
    };
  }

  return {
    title: `Buy ${kind} on mainnet`,
    description: `Use near.com and NEAR Intents-powered DEX routes to buy ${kind} on mainnet.`,
    destinationLabel: "near.com",
    href: "https://near.com",
    ctaLabel: `Open near.com to buy ${kind}`,
    instruction: `Use near.com on mainnet to buy ${kind} with NEAR Intents and receive it in ${signedAccountId ?? "your account"}.`,
  };
}

export function AddValueDialog({ open, onClose }: Props) {
  const { signedAccountId } = useWalletSelector();
  const network = getActiveNetwork();
  const usdcId = useMemo(() => getDefaultUsdcTokenId(network), [network]);
  const [kind, setKind] = useState<TokenKind>(usdcId ? "USDC" : "NEAR");
  const route = useMemo(() => getAddRoute(network, kind, signedAccountId), [network, kind, signedAccountId]);

  useEffect(() => {
    if (!open) return;
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY_SEND_ASSET_KIND) : null;
      if (saved === "USDC" && usdcId) setKind("USDC");
      else if (saved === "NEAR") setKind("NEAR");
    } catch {
      // Ignore errors reading from localStorage (e.g., blocked/unavailable environment)
    }
  }, [open, usdcId]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY_SEND_ASSET_KIND, kind);
    } catch {
      // Ignore errors writing to localStorage (e.g., storage is unavailable)
    }
  }, [kind]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add ${kind}`}
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-5">
        <div className="text-xs text-secondary-text">
          Network: <span className="uppercase font-medium">{network}</span>
        </div>

        <div>
          <div className="text-sm text-secondary-text mb-1">Asset</div>
          <AssetToggle
            value={kind}
            onChange={setKind}
            size="sm"
            variant="primary"
            options={[
              { kind: "NEAR", available: true },
              { kind: "USDC", available: Boolean(usdcId) },
            ]}
          />
        </div>

        <section>
          <div className="text-sm font-medium mb-1">Destination account</div>
          <div className="flex items-center justify-between gap-2 rounded border bg-background px-3 h-10">
            <div className="truncate" title={signedAccountId ?? undefined}>{signedAccountId ?? "—"}</div>
            {signedAccountId && <CopyButton value={signedAccountId} title="Copy account" />}
          </div>
          <div className="mt-2 text-xs text-secondary-text">
            Use this account as the receiver when claiming from a faucet or buying through a DEX flow.
          </div>
        </section>

        <section className="rounded border bg-background p-3">
          <div className="text-sm font-medium">{route.title}</div>
          <div className="mt-1 text-sm text-secondary-text">{route.description}</div>
          <div className="mt-3 text-xs text-secondary-text">Destination</div>
          <div className="mt-1 flex items-center justify-between gap-2 rounded border bg-background px-3 h-10">
            <a
              href={route.href}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-primary underline"
              title={route.href}
            >
              {route.destinationLabel}
            </a>
            <CopyButton value={route.href} title="Copy link" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={route.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline"
            >
              {route.ctaLabel}
            </a>
            <CopyButton value={route.instruction} title="Copy instructions" />
          </div>
          <div className="mt-2 text-xs text-secondary-text">{route.instruction}</div>
        </section>

        {kind === "USDC" && usdcId && (
          <section>
            <div className="text-sm text-secondary-text mb-1">USDC token contract</div>
            <div className="flex items-center justify-between gap-2 rounded border bg-background px-3 h-10">
              <div className="truncate" title={usdcId}>{usdcId}</div>
              <CopyButton value={usdcId} title="Copy token id" />
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}
