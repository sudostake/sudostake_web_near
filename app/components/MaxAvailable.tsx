
"use client";

import React from "react";
import { Balance } from "@/utils/balance";

export interface MaxAvailableProps {
  /** True while the balance is loading. */
  loading?: boolean;
  /** Label prefix before the balance, e.g. "Max available". */
  label?: string;
  /** Balance abstraction with raw and display values. */
  balance: Balance;
  /** Optional suffix to display after the balance, e.g. token symbol. */
  suffix?: string;
  /** Click handler to set the maximum amount. */
  onClick: () => void;
  /** Optional aria-label for the button. */
  buttonAriaLabel?: string;
}

/**
 * UI row displaying the maximum available balance and a "Max" button.
 */
export function MaxAvailable({
  loading = false,
  label = "Max available",
  balance,
  suffix,
  onClick,
  buttonAriaLabel,
}: MaxAvailableProps) {
  return (
    <div className="flex items-center justify-between text-xs text-secondary-text">
      <div>
        {label}: {loading ? "…" : balance.toDisplay()}
        {suffix ? ` ${suffix}` : ""}
      </div>
      <button
        type="button"
        className="underline disabled:no-underline disabled:opacity-60"
        disabled={loading}
        onClick={onClick}
        aria-label={buttonAriaLabel}
      >
        Max
      </button>
    </div>
  );
}
