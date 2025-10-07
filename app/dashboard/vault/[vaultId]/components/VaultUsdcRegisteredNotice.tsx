"use client";

import React from "react";
import { STRINGS } from "@/utils/strings";
import { Card } from "@/app/components/ui/Card";

export function VaultUsdcRegisteredNotice({ registered, className = "" }: { registered: boolean; className?: string }) {
  const base = registered
    ? "border-emerald-400/40 bg-emerald-50/70 text-emerald-900"
    : "border-amber-400/40 bg-amber-50/70 text-amber-900";
  return (
    <Card className={`text-sm ${base} ${className}`}>
      {registered ? STRINGS.vaultRegisteredDefaultToken : STRINGS.vaultNotRegisteredDefaultToken}
    </Card>
  );
}
