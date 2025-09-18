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

// A segmented control with a sliding thumb that animates left/right.
export function AssetToggle({ value, onChange, options, disabled = false, className = "" }: AssetToggleProps) {
  const opts: AssetOption[] = options ?? [
    { kind: "NEAR", available: true },
    { kind: "USDC", available: true },
  ];
  const count = Math.max(1, opts.length);
  const selectedIndex = Math.max(0, opts.findIndex((o) => o.kind === value));
  const segmentWidthPct = 100 / count;

  return (
    <div
      className={[
        "relative inline-flex w-full overflow-hidden select-none items-center rounded-md border border-foreground/10 bg-surface p-1",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      role="tablist"
      aria-label="Asset selector"
    >
      {/* Sliding thumb */}
      <div
        className="absolute top-1 bottom-1 rounded-md bg-primary transition-all duration-200 ease-out pointer-events-none"
        style={{ width: `${segmentWidthPct}%`, left: `${selectedIndex * segmentWidthPct}%` }}
        aria-hidden
      />

      {/* Options */}
      {opts.map((o, i) => {
        const isSelected = i === selectedIndex;
        const isAvailable = o.available !== false && !disabled;
        const label = o.label ?? (o.available === false ? `${o.kind} (unavailable)` : o.kind);
        return (
          <button
            key={o.kind}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-disabled={!isAvailable}
            className={[
              "relative z-10 flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              isSelected ? "text-primary-text" : "text-foreground",
            ].join(" ")}
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
