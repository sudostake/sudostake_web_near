"use client";

import React from "react";

export type SegmentedOption = {
  id: string;
  label: string;
  available?: boolean;
};

export interface SegmentedToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
}

// Generic segmented control with a sliding thumb (visual match with AssetToggle)
export function SegmentedToggle({
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  size = "md",
  ariaLabel = "Segment selector",
}: SegmentedToggleProps) {
  const opts: SegmentedOption[] = options.length > 0 ? options : [{ id: "default", label: "Default" }];
  const count = Math.max(1, opts.length);
  let selectedIndex = opts.findIndex((o) => o.id === value);
  if (selectedIndex === -1) {
    const firstAvailable = opts.findIndex((o) => o.available !== false);
    selectedIndex = firstAvailable !== -1 ? firstAvailable : 0;
  }

  const segmentWidthPct = 100 / count;
  const paddingClass = size === "sm" ? "p-0.5" : "p-1";
  const thumbVert = size === "sm" ? "top-0.5 bottom-0.5" : "top-1 bottom-1";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const btnPad = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";

  return (
    <div
      className={[
        "relative inline-flex w-full overflow-hidden select-none items-center rounded-md border border-foreground/10 bg-surface",
        paddingClass,
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div
        className={["absolute rounded-md bg-primary transition-all duration-200 ease-out pointer-events-none", thumbVert].join(" ")}
        style={{ width: `${segmentWidthPct}%`, left: `${selectedIndex * segmentWidthPct}%` }}
        aria-hidden={true}
      />
      {opts.map((o, i) => {
        const isSelected = i === selectedIndex;
        const isAvailable = o.available !== false && !disabled;
        return (
          <button
            key={o.id}
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
            onClick={() => isAvailable && onChange(o.id)}
            disabled={!isAvailable}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

