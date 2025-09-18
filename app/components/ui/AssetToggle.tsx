"use client";

import React from "react";

export type AssetKind = "NEAR" | "USDC";

export type AssetOption = {
  kind: AssetKind;
  available?: boolean; // when false, button is disabled
  label?: string; // optional custom label (e.g., "USDC (unavailable)")
};

export interface AssetToggleProps {
  value: AssetKind;
  onChange: (value: AssetKind) => void;
  options?: AssetOption[]; // defaults to both NEAR/USDC available
  disabled?: boolean; // disable entire toggle
  className?: string;
}

export function AssetToggle({ value, onChange, options, disabled = false, className = "" }: AssetToggleProps) {
  const opts: AssetOption[] = options ?? [
    { kind: "NEAR", available: true },
    { kind: "USDC", available: true },
  ];

  const baseBtn =
    "px-3 py-1.5 text-sm border rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  const selectedClasses = "bg-primary text-primary-text border-primary";
  const unselectedClasses = "bg-surface border-foreground/10";

  return (
    <div className={["flex gap-2", className].join(" ")} role="tablist" aria-label="Asset selector">
      {opts.map((o) => {
        const isSelected = o.kind === value;
        const isAvailable = o.available !== false && !disabled;
        const label = o.label ?? (o.available === false ? `${o.kind} (unavailable)` : o.kind);
        return (
          <button
            key={o.kind}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-disabled={!isAvailable}
            className={[baseBtn, isSelected ? selectedClasses : unselectedClasses].join(" ")}
            onClick={() => isAvailable && onChange(o.kind)}
            disabled={!isAvailable}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

