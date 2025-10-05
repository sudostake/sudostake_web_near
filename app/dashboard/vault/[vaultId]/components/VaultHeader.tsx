"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { STRINGS } from "@/utils/strings";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { LabelValue } from "@/app/components/ui/LabelValue";
import { NATIVE_TOKEN } from "@/utils/constants";
import type { HeaderCollapseResult } from "@/hooks/useProgressiveHeaderCollapse";

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
  collapse: HeaderCollapseResult;
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
  collapse,
}: Props) {
  const [expanded, setExpanded] = React.useState(false);
  React.useEffect(() => {
    // If user scrolls back to top (no collapse progress), clear expanded state
    if (collapse.pId === 0 && collapse.pBal === 0) setExpanded(false);
  }, [collapse.pId, collapse.pBal]);

  // Show toggle on mobile while sticky/collapsing
  const canToggle = collapse.isMobile && (collapse.stuck || collapse.pId > 0 || collapse.pBal > 0);

  const identityStyle = expanded
    ? { marginTop: 4 }
    : collapse.identityStyle;
  const balancesStyle = expanded
    ? { marginTop: 8 }
    : collapse.balancesStyle;
  const titleStyle = expanded
    ? { transform: "scale(1)", transition: "transform 150ms ease-out" }
    : collapse.titleStyle;

  return (
    <div className="py-2 sm:py-3">
      {/* Toolbar row: back + centered title + spacer for symmetry */}
      <div className="flex items-center gap-2 sm:gap-3">
        <BackButton onClick={onBack} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-center sm:justify-start">
            <h1
              className={["text-lg sm:text-2xl font-semibold break-all", collapse.titleCentered ? "text-center sm:text-left" : ""].join(" ")}
              style={titleStyle}
              title={vaultId}
            >
              {vaultShortName}
            </h1>
          </div>
        </div>
        {canToggle ? (
          <button
            type="button"
            aria-label={expanded ? "Collapse details" : "Expand details"}
            className="inline-flex items-center justify-center h-9 w-9 sm:hidden rounded bg-surface hover:bg-surface/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
            onClick={() => setExpanded((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={["h-5 w-5 transition-transform", expanded ? "rotate-180" : "rotate-0"].join(" ")}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        ) : (
          <div className="shrink-0 w-9 h-9 sm:hidden" aria-hidden />
        )}
      </div>

      {/* Identity row */}
      <div
        ref={collapse.identityRef}
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 items-start min-w-0 overflow-hidden"
        style={identityStyle}
      >
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
              <CopyButton value={vaultId} />
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
                <CopyButton value={owner} />
              </span>
            }
          />
        )}
      </div>

      {/* Balances row */}
      <div
        ref={collapse.balancesRef}
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 overflow-hidden"
        style={balancesStyle}
      >
        <LabelValue
          label={STRINGS.contractBalanceLabel}
          value={
            <span className="inline-flex items-baseline gap-1">
              <span className="truncate" title={`${vaultNear} ${NATIVE_TOKEN}`}>
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
                <span className="truncate" title={`${usdcDisplay} USDC`}>
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
