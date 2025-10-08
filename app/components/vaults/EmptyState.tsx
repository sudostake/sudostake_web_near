"use client";

import React from "react";
import { CreateVaultButton } from "../CreateVaultButton";
import { Card } from "@/app/components/ui/Card";

export type EmptyStateProps = {
  owner?: string;
  factoryId?: string;
  onCreate?: () => void;
};

export function EmptyState({ owner, factoryId, onCreate }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-4 rounded-[28px] border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-6 w-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
        </svg>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          No vaults found{owner ? ` for ${owner}` : ""}{factoryId ? ` on ${factoryId}` : ""}.
        </p>
        <p className="text-sm leading-relaxed text-secondary-text">
          Create a vault to lock collateral and request liquidity when you’re ready.
        </p>
      </div>
      {onCreate && (
        <div className="pt-1">
          <CreateVaultButton onClick={onCreate} />
        </div>
      )}
    </Card>
  );
}
