"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";

export function VaultUsdcRegisteredNotice({ registered, className = "" }: { registered: boolean; className?: string }) {
  const base = registered
    ? "border-emerald-400/40 bg-emerald-50/70 text-emerald-900"
    : "border-amber-400/40 bg-amber-50/70 text-amber-900";
  return (
    <Card className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm ${base} ${className}`}>
      <span className="font-medium">USDC storage</span>
      <Badge variant={registered ? "success" : "warn"}>
        {registered ? "Ready" : "Required"}
      </Badge>
    </Card>
  );
}
