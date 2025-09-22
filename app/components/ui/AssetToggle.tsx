"use client";

import React from "react";
import { SegmentedToggle, type SegmentedOption } from "@/app/components/ui/SegmentedToggle";

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
  variant?: "neutral" | "primary"; // visual emphasis; neutral by default
  ariaLabel?: string;
}

// Asset toggle composed from the generic SegmentedToggle for consistency.
export function AssetToggle({
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  size = "md",
  variant = "neutral",
  ariaLabel = "Asset selector",
}: AssetToggleProps) {
  const optsRaw: AssetOption[] = (options && options.length > 0)
    ? options
    : [
        { kind: "NEAR", available: true },
        { kind: "USDC", available: true },
      ];
  const opts: SegmentedOption[] = optsRaw.map((o) => ({
    id: o.kind,
    label: o.label ?? o.kind,
    available: o.available,
  }));

  return (
    <SegmentedToggle
      value={value}
      onChange={(v) => onChange(v as AssetKind)}
      options={opts}
      disabled={disabled}
      className={className}
      size={size}
      ariaLabel={ariaLabel}
      variant={variant}
    />
  );
}
