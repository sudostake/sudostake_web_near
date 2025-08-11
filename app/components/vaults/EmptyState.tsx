"use client";

import React from "react";
import { CreateVaultButton } from "../CreateVaultButton";

export type EmptyStateProps = {
  owner?: string;
  factoryId?: string;
  onCreate?: () => void;
};

export function EmptyState({ owner, factoryId, onCreate }: EmptyStateProps) {
  return (
    <div className="text-center p-8 text-secondary-text">
      <p>
        No vaults found{owner ? ` for ${owner}` : ""}
        {factoryId ? ` on ${factoryId}` : ""}.
      </p>
      <p className="mt-2">Get started by creating a new vault!</p>
      {onCreate && (
        <div className="mt-4">
          <CreateVaultButton onClick={onCreate} />
        </div>
      )}
    </div>
  );
}
