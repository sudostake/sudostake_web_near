"use client";

import React from "react";
import { parseNumber } from "@/utils/format";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";

function truncateAccount(id: string, max = 24) {
  if (id.length <= max) return id;
  const head = id.slice(0, Math.ceil(max / 2) - 2);
  const tail = id.slice(-Math.floor(max / 2) + 2);
  return `${head}…${tail}`;
}

function summaryStatus(entry: DelegationSummaryEntry): string | null {
  const unstakedParsed = parseNumber(entry.unstaked_balance);
  const stakedParsed = parseNumber(entry.staked_balance);
  const unstakedNum = Number.isNaN(unstakedParsed) ? 0 : unstakedParsed;
  const stakedNum = Number.isNaN(stakedParsed) ? 0 : stakedParsed;
  if (unstakedNum > 0 && entry.can_withdraw) return "withdrawable";
  if (unstakedNum > 0) return "unstaking";
  if (stakedNum > 0) return "active";
  return null;
}

function SummaryItem({ entry }: { entry: DelegationSummaryEntry }) {
  const status = summaryStatus(entry);
  return (
    <li className="py-2" key={entry.validator}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm" title={entry.validator}>{truncateAccount(entry.validator)}</span>
        {status && (
          <span className="text-xs rounded bg-background px-2 py-0.5">{status}</span>
        )}
      </div>
      <div className="mt-1 text-xs text-secondary-text">
        <span>staked: {entry.staked_balance}</span>
        <span className="mx-2 opacity-50">•</span>
        <span>unstaked: {entry.unstaked_balance}</span>
        {entry.unstaked_at !== undefined && entry.current_epoch !== undefined && (
          <span className="ml-2 opacity-80">
            (epoch {entry.current_epoch} / unstaked at {entry.unstaked_at})
          </span>
        )}
      </div>
    </li>
  );
}

export function DelegationsSummary({ entries }: { entries: DelegationSummaryEntry[] }) {
  return (
    <ul className="divide-y">
      {entries.map((entry) => (
        <SummaryItem key={entry.validator} entry={entry} />
      ))}
    </ul>
  );
}

