
"use client";

import React from "react";
import { Balance } from "@/utils/balance";
import { Button } from "@/app/components/ui/Button";

export interface MaxAvailableProps {
  /** True while the balance is loading. */
  loading?: boolean;
  /** Label prefix before the balance, e.g. "Max available". */
  label?: string;
  /** Balance abstraction with raw, display, and symbol. */
  balance: Balance;
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
  onClick,
  buttonAriaLabel,
}: MaxAvailableProps) {
  return (
    <div className="flex items-center justify-between text-xs text-secondary-text">
      <div>
        {label}: {loading ? "…" : balance.toDisplay()} {balance.symbol}
      </div>
      <Button variant="ghost" size="sm" disabled={loading} onClick={onClick} aria-label={buttonAriaLabel}>
        Max
      </Button>
    </div>
  );
}
