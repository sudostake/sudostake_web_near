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
  variant?: "neutral" | "primary";
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
  variant = "neutral",
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
  const btnPad = size === "sm" ? "px-3 py-1" : "px-4 py-1.5";

  const isPrimary = variant === "primary";
  const thumbClasses = [
    "absolute rounded-full pointer-events-none transition-all duration-200 ease-out",
    thumbVert,
    isPrimary ? "bg-primary shadow-sm" : "bg-surface shadow-sm ring-1 ring-foreground/10",
  ].join(" ");
  const selectedText = isPrimary ? "text-primary-text" : "text-foreground";
  const unselectedText = isPrimary ? "text-foreground" : "text-secondary-text";

  // Horizontal inset so the thumb and segments don't touch edges
  const padPx = size === "sm" ? 2 : 6;

  function moveSelection(delta: number) {
    const dir = Math.sign(delta);
    if (dir === 0) return;
    let i = selectedIndex;
    for (let step = 0; step < count; step++) {
      i = (i + dir + count) % count;
      const opt = opts[i];
      if (opt && opt.available !== false) {
        onChange(opt.id);
        // Attempt to move focus to the newly selected tab
        try {
          const el = document.getElementById(`${opt.id}-trigger`);
          if (el) (el as HTMLButtonElement).focus();
        } catch {}
        break;
      }
    }
  }

  return (
    <div
      className={[
        "relative inline-flex w-full select-none items-center overflow-hidden rounded-full border border-foreground/10 bg-surface-muted/60",
        paddingClass,
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); moveSelection(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); moveSelection(-1); }
      }}
    >
      <div
        className={thumbClasses}
        style={{
          width: `calc(${segmentWidthPct}% - ${padPx * 2}px)`,
          left: `calc(${selectedIndex * segmentWidthPct}% + ${padPx}px)`,
        }}
        aria-hidden
      />
      {opts.map((o, i) => {
        const isSelected = i === selectedIndex;
        const isAvailable = o.available !== false && !disabled;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            id={`${o.id}-trigger`}
            aria-selected={isSelected}
            aria-disabled={!isAvailable}
            aria-controls={`${o.id}-panel`}
            tabIndex={isSelected ? 0 : -1}
            className={[
              "relative z-10 flex-1 rounded-full transition-colors",
              btnPad,
              textSize,
              isSelected ? `font-semibold ${selectedText}` : `font-medium ${unselectedText}`,
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
