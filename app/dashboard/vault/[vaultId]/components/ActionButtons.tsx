"use client";

import React from "react";

export interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  disabled: boolean;
}

export function ActionButtons({ onDeposit, onWithdraw, disabled }: ActionButtonsProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <button
        type="button"
        onClick={onDeposit}
        disabled={disabled}
        className="rounded bg-primary text-primary-text py-3 px-4 text-center font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Deposit
      </button>
      <button
        type="button"
        onClick={onWithdraw}
        disabled={disabled}
        className="rounded border py-3 px-4 text-center bg-surface hover:bg-surface/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Withdraw
      </button>
      <button
        type="button"
        disabled={disabled}
        className="rounded border py-3 px-4 text-center bg-surface hover:bg-surface/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Transfer
      </button>
    </section>
  );
}
