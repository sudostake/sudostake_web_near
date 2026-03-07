"use client";

import React from "react";
import { parseNumber } from "@/utils/format";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { useDelegationsActions } from "./DelegationsActionsContext";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { explorerAccountUrl, getActiveNetwork } from "@/utils/networks";
import { STRINGS } from "@/utils/strings";

function ValueRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-secondary-text">{label}</div>
      <div className="mt-1 break-all font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}

function SummaryItem({ entry, flat = false }: { entry: DelegationSummaryEntry; flat?: boolean }) {
  const { onDelegate, onUndelegate, onUnclaimUnstaked } = useDelegationsActions();
  const stakedDisplay = `${entry.staked_balance.toDisplay()} ${entry.staked_balance.symbol}`;
  const unstakedDisplay = `${entry.unstaked_balance.toDisplay()} ${entry.unstaked_balance.symbol}`;
  const withdrawableNow = entry.can_withdraw ? unstakedDisplay : `0 ${entry.unstaked_balance.symbol}`;

  const stakedParsed = parseNumber(entry.staked_balance.toDisplay());
  const unstakedParsed = parseNumber(entry.unstaked_balance.toDisplay());
  const stakedNum = Number.isNaN(stakedParsed) ? 0 : stakedParsed;
  const unstakedNum = Number.isNaN(unstakedParsed) ? 0 : unstakedParsed;

  const canUndelegate = Boolean(onUndelegate) && stakedNum > 0;
  const canClaim = Boolean(onUnclaimUnstaked) && entry.can_withdraw && unstakedNum > 0;
  const canDelegate = Boolean(onDelegate);

  return (
    <li
      className={
        flat
          ? "py-4 first:pt-0 last:pb-0"
          : "rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4"
      }
      key={entry.validator}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <a
          href={explorerAccountUrl(getActiveNetwork(), entry.validator)}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-mono text-sm transition-colors hover:text-primary"
          title={entry.validator}
          aria-label={`View validator ${entry.validator} on explorer`}
        >
          {entry.validator}
        </a>
        <CopyButton value={entry.validator} title="Copy validator" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ValueRow label={STRINGS.stakedLabelUI} value={stakedDisplay} />
        <ValueRow label={STRINGS.unstakedLabelUI} value={unstakedDisplay} />
        <ValueRow label="Withdrawable now" value={withdrawableNow} />
      </div>

      {Boolean(onDelegate || onUndelegate || onUnclaimUnstaked) && (
        <div className={flat ? "mt-4 pt-1" : "mt-4 border-t border-foreground/10 pt-3"}>
          <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
            {canClaim && (
              <button
                type="button"
                aria-label={`Claim unstaked for ${entry.validator}`}
                className="rounded-full bg-primary px-2.5 py-1 text-xs whitespace-nowrap text-primary-text focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onUnclaimUnstaked?.(entry.validator)}
                disabled={!canClaim}
              >
                {STRINGS.claimAction}
              </button>
            )}
            {onDelegate && (
              <button
                type="button"
                aria-label={`Delegate to ${entry.validator}`}
                className={[
                  "rounded-full px-2.5 py-1 text-xs whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60",
                  canClaim
                    ? "border border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-muted)]"
                    : "bg-primary text-primary-text",
                ].join(" ")}
                onClick={() => onDelegate(entry.validator)}
                disabled={!canDelegate}
              >
                {STRINGS.delegateAction}
              </button>
            )}
            {onUndelegate && (
              <button
                type="button"
                aria-label={`Undelegate from ${entry.validator}`}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1 text-xs whitespace-nowrap hover:bg-[color:var(--surface-muted)] focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onUndelegate(entry.validator)}
                disabled={!canUndelegate}
              >
                {STRINGS.undelegateAction}
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export function DelegationsSummary({
  entries,
  flat = false,
}: {
  entries: DelegationSummaryEntry[];
  flat?: boolean;
}) {
  return (
    <div className={flat ? "" : "space-y-2"} aria-label="Delegations summary">
      <ul className={flat ? "space-y-4" : "space-y-2"}>
        {entries.map((entry) => (
          <SummaryItem key={entry.validator} entry={entry} flat={flat} />
        ))}
      </ul>
    </div>
  );
}
