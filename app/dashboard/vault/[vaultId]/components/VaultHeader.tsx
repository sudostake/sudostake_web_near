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
  vaultShortName: string;
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
    <Card
      className="flex flex-col gap-6 rounded-[32px] border-white/12 bg-surface/95 px-6 py-8 shadow-[0_26px_90px_-55px_rgba(15,23,42,0.68)]"
      role="region"
      aria-label="Vault overview"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">Vault overview</p>
            <h1 className="mt-1 break-all text-[clamp(1.9rem,4.2vw,2.65rem)] font-semibold" title={vaultId}>
              {vaultShortName}
            </h1>
          </div>
        </div>
        {badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  badge.tone === "warn"
                    ? "border-orange-300/50 bg-orange-100/25 text-orange-600"
                    : "border-primary/40 bg-primary/10 text-primary",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    badge.tone === "warn" ? "bg-orange-500" : "bg-primary",
                  ].join(" ")}
                />
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LabelValue
          label={STRINGS.vaultIdLabel}
          value={
            <span className="inline-flex min-w-0 items-center gap-2">
              <Link
                href={explorerAccountUrl(network, vaultId)}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono underline decoration-dotted"
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
              <span className="inline-flex min-w-0 items-center gap-2 break-all">
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
            <span className="inline-flex items-baseline gap-1 text-xl font-semibold text-foreground">
              <span className="break-all" title={`${vaultNear} ${NATIVE_TOKEN}`}>
                {vaultNearLoading ? "Loading…" : vaultNear}
              </span>
              <span className="text-sm text-secondary-text/80">{NATIVE_TOKEN}</span>
            </span>
          }
        />
        {usdcDisplay !== null && usdcDisplay !== undefined && (
          <LabelValue
            label={STRINGS.usdcBalanceLabel}
            value={
              <span className="inline-flex items-baseline gap-1 text-xl font-semibold text-foreground">
                <span className="break-all" title={`${usdcDisplay} USDC`}>
                  {vaultUsdcLoading ? "Loading…" : usdcDisplay}
                </span>
                <span className="text-sm text-secondary-text/80">USDC</span>
              </span>
            }
          />
        )}
      </div>
    </Card>
  );
}
