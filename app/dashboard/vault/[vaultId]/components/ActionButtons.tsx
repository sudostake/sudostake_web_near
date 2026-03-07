"use client";

import React from "react";
import { STRINGS } from "@/utils/strings";

export interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  onTransfer: () => void;
  disabled: boolean;
}

export function ActionButtons({ onDeposit, onWithdraw, onTransfer, disabled }: ActionButtonsProps) {
  const actions = [
    {
      label: STRINGS.depositAction,
      onClick: onDeposit,
      accent: "border-primary/25 bg-primary/8 hover:border-primary/45 hover:bg-primary/12",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M12 3.75a.75.75 0 01.75.75V11h6.5a.75.75 0 110 1.5H12.75v6.5a.75.75 0 01-1.5 0V12.5H4.75a.75.75 0 010-1.5h6.5V4.5a.75.75 0 01.75-.75z" />
        </svg>
      ),
    },
    {
      label: STRINGS.withdrawAction,
      onClick: onWithdraw,
      accent: "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-primary/35 hover:bg-[color:var(--surface-muted)]",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M5 12.75a.75.75 0 010-1.5h14a.75.75 0 010 1.5H5z" />
        </svg>
      ),
    },
    {
      label: STRINGS.transferAction,
      onClick: onTransfer,
      accent: "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-primary/35 hover:bg-[color:var(--surface-muted)]",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M7.5 8.25h7.19l-2.72-2.72a.75.75 0 111.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 11-1.06-1.06l2.72-2.72H7.5a.75.75 0 110-1.5zM16.5 15.75H9.31l2.72 2.72a.75.75 0 11-1.06 1.06L6.72 15.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 111.06 1.06l-2.72 2.72h7.19a.75.75 0 110 1.5z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3" aria-label="Vault actions">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          disabled={disabled}
          className={[
            "group flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition-[border-color,background-color,box-shadow] duration-150 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-60",
            action.accent,
          ].join(" ")}
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current/15 bg-white/40 text-primary dark:bg-black/10">
            {action.icon}
          </span>
          <span className="block break-words text-xs font-semibold uppercase tracking-[0.08em] text-foreground">{action.label}</span>
        </button>
      ))}
    </section>
  );
}
