"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { STRINGS } from "@/utils/strings";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { NATIVE_TOKEN } from "@/utils/constants";
import { Card } from "@/app/components/ui/Card";
import Link from "next/link";
import { shortAmount } from "@/utils/format";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={STRINGS.back}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
    </button>
  );
}

type Props = {
  onBack: () => void;
  vaultId: string;
  vaultShortName?: string;
  network: Network;
  owner: string | null | undefined;
  vaultNear: string;
  vaultNearLoading: boolean;
  usdcDisplay: string | null | undefined;
  vaultUsdcLoading: boolean;
  state?: string | null;
  liquidation?: boolean;
};

const STATUS_TONE: Record<string, "primary" | "warn"> = {
  active: "primary",
  idle: "primary",
  pending: "warn",
};

const BADGE_STYLES: Record<"primary" | "warn", string> = {
  primary: "border-primary/30 bg-primary/10 text-primary",
  warn: "border-amber-200/60 bg-amber-50/70 text-amber-700",
};

export function VaultHeader({
  onBack,
  vaultId,
  network,
  owner,
  vaultNear,
  vaultNearLoading,
  usdcDisplay,
  vaultUsdcLoading,
  state,
  liquidation,
}: Props) {
  if (state != null && typeof state !== "string") {
    console.warn("VaultHeader received a state value that is not a string.", { state });
  }
  const normalizedState = typeof state === "string" ? state.trim() : "";

  if (liquidation != null && typeof liquidation !== "boolean") {
    console.warn("VaultHeader received a liquidation value that is not a boolean.", { liquidation });
  }
  const normalizedLiquidation = liquidation === true;
  const compactNear = vaultNearLoading || vaultNear === "—" ? vaultNear : shortAmount(vaultNear, 6);
  const compactUsdc = vaultUsdcLoading ? "Loading..." : usdcDisplay ? shortAmount(usdcDisplay, 2) : usdcDisplay;

  const badges: Array<{ label: string; tone: "primary" | "warn" }> = [];
  if (normalizedState) {
    const lower = normalizedState.toLowerCase();
    const tone = STATUS_TONE[lower] ?? "primary";
    badges.push({ label: lower.charAt(0).toUpperCase() + lower.slice(1), tone });
  }
  if (normalizedLiquidation) {
    badges.push({ label: "Liquidation active", tone: "warn" });
  }

  return (
    <Card className="surface-card space-y-4 rounded-3xl px-5 py-5 sm:px-6 sm:py-6" role="region" aria-label="Vault overview">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <BackButton onClick={onBack} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Vault</p>
            <h1 className="mt-1 break-all text-[clamp(1.55rem,3.1vw,2.05rem)] font-semibold leading-tight" title={vaultId}>
              {vaultId}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 text-sm font-semibold uppercase tracking-wide text-secondary-text">
            {network}
          </span>
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-wide",
                BADGE_STYLES[badge.tone],
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  badge.tone === "warn" ? "bg-amber-500" : "bg-primary",
                ].join(" ")}
              />
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCell label={STRINGS.vaultIdLabel}>
          <div className="flex min-w-0 flex-wrap items-start gap-2">
            <Link
              href={explorerAccountUrl(network, vaultId)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 break-all font-mono text-sm underline decoration-dotted"
              title={vaultId}
              aria-label={`View vault ${vaultId} on explorer`}
            >
              {vaultId}
            </Link>
            <CopyButton value={vaultId} title="Copy vault ID" className="shrink-0 self-start" />
          </div>
        </OverviewCell>

        <OverviewCell label={STRINGS.ownerLabel}>
          {owner ? (
            <div className="flex min-w-0 flex-wrap items-start gap-2">
              <Link
                href={explorerAccountUrl(network, owner)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 break-all font-mono text-sm underline decoration-dotted"
                title={owner}
                aria-label={`View owner ${owner} on explorer`}
              >
                {owner}
              </Link>
              <CopyButton value={owner} title="Copy owner ID" className="shrink-0 self-start" />
            </div>
          ) : (
            <span className="text-sm text-secondary-text">—</span>
          )}
        </OverviewCell>

        <OverviewCell label={STRINGS.contractBalanceLabel}>
          <span className="flex min-w-0 flex-wrap items-baseline gap-1 text-lg font-semibold text-foreground">
            <span className="break-all" title={`${vaultNear} ${NATIVE_TOKEN}`}>
              {vaultNearLoading ? "Loading..." : compactNear}
            </span>
            <span className="text-xs text-secondary-text">{NATIVE_TOKEN}</span>
          </span>
        </OverviewCell>

        <OverviewCell label={STRINGS.usdcBalanceLabel}>
          {usdcDisplay !== null && usdcDisplay !== undefined ? (
            <span className="flex min-w-0 flex-wrap items-baseline gap-1 text-lg font-semibold text-foreground">
              <span className="break-all" title={`${usdcDisplay} USDC`}>
                {compactUsdc}
              </span>
              <span className="text-xs text-secondary-text">USDC</span>
            </span>
          ) : (
            <span className="text-sm text-secondary-text">—</span>
          )}
        </OverviewCell>
      </div>
    </Card>
  );
}

function OverviewCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 border-l-2 border-[color:color-mix(in_oklab,var(--border)_72%,transparent)] pl-3 sm:pl-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text">{label}</p>
      <div className="mt-1 min-h-[24px]">{children}</div>
    </div>
  );
}
