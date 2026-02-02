"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { STRINGS } from "@/utils/strings";
import { UnbondingList, type UnbondingEntryRow } from "./UnbondingList";

type Props = {
  title?: string;
  count: number;
  totalLabel?: string | null;
  etaLabel?: string | null;
  entries: UnbondingEntryRow[];
  open: boolean;
  onToggle: () => void;
  footnote?: string;
  className?: string;
};

export function UnbondingStatusCard({
  title = STRINGS.waitingToUnlock,
  count,
  totalLabel,
  etaLabel,
  entries,
  open,
  onToggle,
  footnote,
  className,
}: Props) {
  const countLabel = `${count} ${count === 1 ? "validator" : "validators"}`;
  return (
    <Card className={["p-3", className].filter(Boolean).join(" ")}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <Badge variant="neutral" aria-label={countLabel}>{countLabel}</Badge>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            className="text-xs underline text-primary shrink-0"
            onClick={onToggle}
          >
            {open ? STRINGS.hideDetails : STRINGS.showDetails}
          </button>
        )}
      </div>

      {!open && (
        <div className="mt-2 text-sm">
          {typeof totalLabel === "string" && totalLabel.length > 0 && (
            <div className="font-medium">{totalLabel} NEAR</div>
          )}
          {etaLabel && <div className="text-xs text-secondary-text mt-0.5">up to ~{etaLabel}</div>}
        </div>
      )}

      {open && entries.length > 0 && (
        <>
          <div className="mt-3">
            <UnbondingList entries={entries} bare />
          </div>
          {footnote && (
            <div className="mt-2 text-xs text-secondary-text">{footnote}</div>
          )}
        </>
      )}
    </Card>
  );
}
