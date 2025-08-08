"use client";

import React from "react";

export type EmptyStateProps = {
  owner?: string;
  factoryId?: string;
};

export function EmptyState({ owner, factoryId }: EmptyStateProps) {
  return (
    <div className="text-center p-8 text-secondary-text">
      <p>
        No vaults found{owner ? ` for ${owner}` : ""}
        {factoryId ? ` on ${factoryId}` : ""}.
      </p>
      <p className="mt-2">Get started by creating a new vault!</p>
    </div>
  );
}
