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
  size?: "sm" | "md"; // visual density
}

// A segmented control with a sliding thumb that animates left/right.
export function AssetToggle({ value, onChange, options, disabled = false, className = "", size = "md" }: AssetToggleProps) {
  const opts: AssetOption[] = options ?? [
    { kind: "NEAR", available: true },
    { kind: "USDC", available: true },
  ];
  const count = Math.max(1, opts.length);
  const selectedIndex = Math.max(0, opts.findIndex((o) => o.kind === value));
  const segmentWidthPct = 100 / count;
  const paddingClass = size === "sm" ? "p-0.5" : "p-1";
  const thumbVert = size === "sm" ? "top-0.5 bottom-0.5" : "top-1 bottom-1";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const btnPad = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";

  function getDisplayLabel(option: AssetOption): string {
    if (option.label) return option.label;
    return option.available === false ? `${option.kind} (unavailable)` : option.kind;
  }

  return (
    <div
      className={[
        "relative inline-flex w-full overflow-hidden select-none items-center rounded-md border border-foreground/10 bg-surface",
        paddingClass,
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      role="tablist"
      aria-label="Asset selector"
    >
      {/* Sliding thumb */}
      <div
        className={["absolute rounded-md bg-primary transition-all duration-200 ease-out pointer-events-none", thumbVert].join(" ")}
        style={{ width: `${segmentWidthPct}%`, left: `${selectedIndex * segmentWidthPct}%` }}
        aria-hidden={true}
      />

      {/* Options */}
      {opts.map((o, i) => {
        const isSelected = i === selectedIndex;
        const isAvailable = o.available !== false && !disabled;
        const label = getDisplayLabel(o);
        return (
          <button
            key={o.kind}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-disabled={!isAvailable}
            className={[
              "relative z-10 flex-1 rounded-md transition-colors",
              btnPad,
              textSize,
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
