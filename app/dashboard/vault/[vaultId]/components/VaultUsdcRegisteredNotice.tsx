"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";

export function VaultUsdcRegisteredNotice({ registered, className = "" }: { registered: boolean; className?: string }) {
  const base = registered
    ? "border-emerald-400/40 bg-emerald-50/70 text-emerald-900"
    : "border-amber-400/40 bg-amber-50/70 text-amber-900";
  return (
    <Card className={`flex flex-col items-start gap-2 rounded-2xl px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${base} ${className}`}>
      <span className="font-medium">USDC storage</span>
      <Badge variant={registered ? "success" : "warn"}>
        {registered ? "Ready" : "Required"}
      </Badge>
    </Card>
  );
}
