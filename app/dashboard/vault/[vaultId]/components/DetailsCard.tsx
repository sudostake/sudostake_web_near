"use client";

import React from "react";

export interface DetailsCardProps {
  vaultId: string;
  owner: string | null;
  factoryId: string;
}

export function DetailsCard({ vaultId, owner, factoryId }: DetailsCardProps) {
  return (
    <section className="rounded bg-surface p-4">
      <h2 className="font-medium">Details</h2>
      <div className="mt-2 text-sm text-secondary-text space-y-1">
        <div>
          <span className="text-foreground/80">Vault ID:</span>{" "}
          <span className="break-all" title={vaultId}>{vaultId}</span>
        </div>
        {owner && (
          <div>
            <span className="text-foreground/80">Owner:</span>{" "}
            <span className="break-all" title={owner}>{owner}</span>
          </div>
        )}
        <div>
          <span className="text-foreground/80">Factory:</span>{" "}
          <span className="break-all" title={factoryId}>{factoryId}</span>
        </div>
      </div>
    </section>
  );
}
