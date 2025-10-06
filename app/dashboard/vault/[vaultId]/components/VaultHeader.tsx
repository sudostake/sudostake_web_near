"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { STRINGS } from "@/utils/strings";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { LabelValue } from "@/app/components/ui/LabelValue";
import { NATIVE_TOKEN } from "@/utils/constants";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={STRINGS.back}
      className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded bg-surface hover:bg-surface/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
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
  // Static header (no progressive collapse)

  return (
    <div className="py-2 sm:py-3">
      {/* Toolbar row: back + centered title + spacer for symmetry */}
      <div className="flex items-center gap-2 sm:gap-3">
        <BackButton onClick={onBack} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-center sm:justify-start">
            <h1 className="text-lg sm:text-2xl font-semibold break-all text-center sm:text-left" title={vaultId}>
              {vaultShortName}
            </h1>
          </div>
        </div>
        <div className="shrink-0 w-9 h-9 sm:hidden" aria-hidden />
      </div>

      {/* Identity row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 items-start min-w-0 mt-1">
        <LabelValue
          label={STRINGS.vaultIdLabel}
          value={
            <span className="inline-flex items-center gap-2 min-w-0">
              <a
                href={explorerAccountUrl(network, vaultId)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all"
                title={vaultId}
                aria-label={`View vault ${vaultId} on explorer`}
              >
                {vaultId}
              </a>
              <CopyButton value={vaultId} title="Copy vault ID" />
            </span>
          }
        />
        {owner && (
          <LabelValue
            label={STRINGS.ownerLabel}
            value={
              <span className="inline-flex items-center gap-2 min-w-0 break-all">
                <a
                  href={explorerAccountUrl(network, owner)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline break-all"
                  title={owner}
                  aria-label={`View owner ${owner} on explorer`}
                >
                  <span className="font-mono break-all">{owner}</span>
                </a>
                <CopyButton value={owner} title="Copy owner ID" />
              </span>
            }
          />
        )}
      </div>

      {/* Balances row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
        <LabelValue
          label={STRINGS.contractBalanceLabel}
          value={
            <span className="inline-flex items-baseline gap-1">
              <span className="break-all" title={`${vaultNear} ${NATIVE_TOKEN}`}>
                {vaultNearLoading ? "Loading…" : vaultNear}
              </span>
              <span className="text-secondary-text">{NATIVE_TOKEN}</span>
            </span>
          }
        />
        {usdcDisplay !== null && usdcDisplay !== undefined && (
          <LabelValue
            label={STRINGS.usdcBalanceLabel}
            value={
              <span className="inline-flex items-baseline gap-1">
                <span className="break-all" title={`${usdcDisplay} USDC`}>
                  {vaultUsdcLoading ? "Loading…" : usdcDisplay}
                </span>
                <span className="text-secondary-text">USDC</span>
              </span>
            }
          />
        )}
      </div>
    </div>
  );
}
