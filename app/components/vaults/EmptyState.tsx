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
    <Card className="text-center p-6">
      <p className="text-secondary-text">
        No vaults found{owner ? ` for ${owner}` : ""}
        {factoryId ? ` on ${factoryId}` : ""}.
      </p>
      <p className="mt-2 text-secondary-text">Get started by creating a new vault!</p>
      {onCreate && (
        <div className="mt-4">
          <CreateVaultButton onClick={onCreate} />
        </div>
      )}
    </Card>
  );
}
