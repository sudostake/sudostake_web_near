"use client";

import React from "react";
import { STRINGS } from "@/utils/strings";

export function VaultUsdcRegisteredNotice({ registered, className = "" }: { registered: boolean; className?: string }) {
  const base = registered
    ? "border-emerald-500/30 bg-emerald-100/30 text-emerald-900 dark:text-emerald-100"
    : "border-amber-500/30 bg-amber-100/40 text-amber-900 dark:text-amber-100";
  return (
    <div className={`rounded border p-3 text-sm ${base} ${className}`}>
      {registered ? (
        <div>{STRINGS.vaultRegisteredDefaultToken}</div>
      ) : (
        <div>{STRINGS.vaultNotRegisteredDefaultToken}</div>
      )}
    </div>
  );
}
