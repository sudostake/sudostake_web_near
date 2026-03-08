"use client";

import React from "react";
import { parseNumber } from "@/utils/format";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { useDelegationsActions } from "./DelegationsActionsContext";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { explorerAccountUrl, getActiveNetwork } from "@/utils/networks";
import { STRINGS } from "@/utils/strings";
import { Button } from "@/app/components/ui/Button";

function ValueRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</div>
      <div className="break-all font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}

function validatorStatus(entry: DelegationSummaryEntry, unstakedNum: number) {
  if (entry.can_withdraw && unstakedNum > 0) return STRINGS.statusWithdrawable;
  if (unstakedNum > 0) return STRINGS.statusUnstaking;
  return STRINGS.statusActive;
}

function SummaryItem({ entry }: { entry: DelegationSummaryEntry }) {
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
  const status = validatorStatus(entry, unstakedNum);

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="grid gap-x-6 gap-y-4 xl:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
        <div className="min-w-0 space-y-2">
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
          <div className="text-sm text-secondary-text">{status}</div>
        </div>

        <ValueRow label={STRINGS.stakedLabelUI} value={stakedDisplay} />
        <ValueRow label={STRINGS.unstakedLabelUI} value={unstakedDisplay} />
        <ValueRow label="Withdrawable now" value={withdrawableNow} />
      </div>

      {Boolean(onDelegate || onUndelegate || onUnclaimUnstaked) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-foreground/10 pt-4">
          {canClaim && (
            <Button
              type="button"
              size="sm"
              onClick={() => onUnclaimUnstaked?.(entry.validator)}
              disabled={!canClaim}
            >
              {STRINGS.claimAction}
            </Button>
          )}
          {onDelegate && (
            <Button
              type="button"
              size="sm"
              variant={canClaim ? "secondary" : "primary"}
              onClick={() => onDelegate(entry.validator)}
              disabled={!canDelegate}
            >
              {STRINGS.delegateAction}
            </Button>
          )}
          {onUndelegate && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onUndelegate(entry.validator)}
              disabled={!canUndelegate}
            >
              {STRINGS.undelegateAction}
            </Button>
          )}
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
    <div
      className={[
        flat ? "" : "rounded-app border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-1 sm:px-5",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Delegations summary"
    >
      <ul className="divide-y divide-foreground/10">
        {entries.map((entry) => (
          <SummaryItem key={entry.validator} entry={entry} />
        ))}
      </ul>
    </div>
  );
}
