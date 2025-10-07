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
    <Card className="text-center py-10">
      <p className="text-sm text-secondary-text">
        No vaults found{owner ? ` for ${owner}` : ""}
        {factoryId ? ` on ${factoryId}` : ""}.
      </p>
      <p className="mt-2 text-sm text-secondary-text">Create a vault to lock collateral and request liquidity.</p>
      {onCreate && (
        <div className="mt-6 flex justify-center">
          <CreateVaultButton onClick={onCreate} />
        </div>
      )}
    </Card>
  );
}
