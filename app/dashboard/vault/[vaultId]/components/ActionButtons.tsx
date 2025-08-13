"use client";

import React from "react";

export interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  disabled: boolean;
}

export function ActionButtons({ onDeposit, onWithdraw, disabled }: ActionButtonsProps) {
  const baseBtn =
    "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed";
  const primaryBtn = `${baseBtn} bg-primary text-primary-text hover:bg-primary/90 active:bg-primary/95`;
  const secondaryBtn = `${baseBtn} border border-foreground/10 bg-surface text-foreground hover:bg-surface/90 active:bg-surface/80`;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <button type="button" onClick={onDeposit} disabled={disabled} className={primaryBtn}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 3.75a.75.75 0 01.75.75V11h6.5a.75.75 0 010 1.5H12.75v6.5a.75.75 0 01-1.5 0V12.5H4.75a.75.75 0 010-1.5h6.5V4.5a.75.75 0 01.75-.75z" />
        </svg>
        <span>Deposit</span>
      </button>

      <button type="button" onClick={onWithdraw} disabled={disabled} className={secondaryBtn}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path fillRule="evenodd" clipRule="evenodd" d="M5 12.75a.75.75 0 010-1.5h14a.75.75 0 010 1.5H5z" />
        </svg>
        <span>Withdraw</span>
      </button>

      <button type="button" disabled={disabled} className={secondaryBtn}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M7.5 8.25h7.19l-2.72-2.72a.75.75 0 111.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 11-1.06-1.06l2.72-2.72H7.5a.75.75 0 110-1.5zM16.5 15.75H9.31l2.72 2.72a.75.75 0 11-1.06 1.06L6.72 15.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 111.06 1.06l-2.72 2.72h7.19a.75.75 0 110 1.5z" />
        </svg>
        <span>Transfer</span>
      </button>
    </section>
  );
}
