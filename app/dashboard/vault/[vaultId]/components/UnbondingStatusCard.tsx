"use client";

import React from "react";
import { STRINGS } from "@/utils/strings";
import { UnbondingList, type UnbondingEntryRow } from "./UnbondingList";
import { Button } from "@/app/components/ui/Button";

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
  const summary = totalLabel ? `${totalLabel} NEAR across ${countLabel}` : countLabel;
  const meta = etaLabel ? `${summary} · ETA ${etaLabel}` : summary;

  return (
    <section className={["space-y-4 border-t border-foreground/10 pt-4", className].filter(Boolean).join(" ")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <p className="text-sm text-secondary-text">{meta}</p>
        </div>

        {entries.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={onToggle}>
            {open ? STRINGS.hideDetails : STRINGS.showDetails}
          </Button>
        )}
      </div>

      {open && entries.length > 0 ? (
        <div className="space-y-3">
          <UnbondingList entries={entries} bare />
          {footnote && <div className="text-xs text-secondary-text">{footnote}</div>}
        </div>
      ) : null}
    </section>
  );
}
