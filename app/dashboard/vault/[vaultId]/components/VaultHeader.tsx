"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { STRINGS } from "@/utils/strings";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { LabelValue } from "@/app/components/ui/LabelValue";
import { NATIVE_TOKEN } from "@/utils/constants";
import { Card } from "@/app/components/ui/Card";
import Link from "next/link";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={STRINGS.back}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-surface hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-5 w-5"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
    </button>
  );
}

type Props = {
  onBack: () => void;
  vaultId: string;
  vaultShortName: string;
  network: Network;
  owner: string | null | undefined;
  vaultNear: string;
  vaultNearLoading: boolean;
  usdcDisplay: string | null | undefined;
  vaultUsdcLoading: boolean;
};

export function VaultHeader({
  onBack,
  vaultId,
  vaultShortName,
  network,
  owner,
  vaultNear,
  vaultNearLoading,
  usdcDisplay,
  vaultUsdcLoading,
}: Props) {
  return (
    <Card className="flex flex-col gap-6" role="region" aria-label="Vault overview">
      <div className="flex items-center gap-4">
        <BackButton onClick={onBack} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Vault overview</p>
          <h1 className="mt-1 break-all text-[clamp(1.85rem,4vw,2.6rem)] font-semibold" title={vaultId}>
            {vaultShortName}
          </h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LabelValue
          label={STRINGS.vaultIdLabel}
          value={
            <span className="inline-flex items-center gap-2 min-w-0">
              <Link
                href={explorerAccountUrl(network, vaultId)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono underline decoration-dotted break-all"
                title={vaultId}
                aria-label={`View vault ${vaultId} on explorer`}
              >
                {vaultId}
              </Link>
              <CopyButton value={vaultId} title="Copy vault ID" />
            </span>
          }
        />
        {owner && (
          <LabelValue
            label={STRINGS.ownerLabel}
            value={
              <span className="inline-flex items-center gap-2 min-w-0 break-all">
                <Link
                  href={explorerAccountUrl(network, owner)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono underline decoration-dotted"
                  title={owner}
                  aria-label={`View owner ${owner} on explorer`}
                >
                  {owner}
                </Link>
                <CopyButton value={owner} title="Copy owner ID" />
              </span>
            }
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LabelValue
          label={STRINGS.contractBalanceLabel}
          value={
            <span className="inline-flex items-baseline gap-1 text-lg font-semibold">
              <span className="break-all" title={`${vaultNear} ${NATIVE_TOKEN}`}>
                {vaultNearLoading ? "Loading…" : vaultNear}
              </span>
              <span className="text-sm text-secondary-text">{NATIVE_TOKEN}</span>
            </span>
          }
        />
        {usdcDisplay !== null && usdcDisplay !== undefined && (
          <LabelValue
            label={STRINGS.usdcBalanceLabel}
            value={
              <span className="inline-flex items-baseline gap-1 text-lg font-semibold">
                <span className="break-all" title={`${usdcDisplay} USDC`}>
                  {vaultUsdcLoading ? "Loading…" : usdcDisplay}
                </span>
                <span className="text-sm text-secondary-text">USDC</span>
              </span>
            }
          />
        )}
      </div>
    </Card>
  );
}
