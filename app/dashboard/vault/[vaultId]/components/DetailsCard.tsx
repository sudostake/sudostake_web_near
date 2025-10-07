"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";

export interface DetailsCardProps {
  vaultId: string;
  owner: string | null;
  factoryId: string;
}

export function DetailsCard({ vaultId, owner, factoryId }: DetailsCardProps) {
  return (
    <Card className="space-y-3" role="region" aria-label="Vault details">
      <h2 className="text-lg font-semibold">Details</h2>
      <dl className="grid gap-2 text-sm text-secondary-text">
        <Detail label="Vault ID" value={vaultId} />
        {owner && <Detail label="Owner" value={owner} />}
        <Detail label="Factory" value={factoryId} />
      </dl>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wide">{label}</dt>
      <dd className="break-all text-foreground" title={value}>
        {value}
      </dd>
    </div>
  );
}
