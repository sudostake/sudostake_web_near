"use client";

import React from "react";
import { Button } from "@/app/components/ui/Button";
import { STRINGS } from "@/utils/strings";
import { Card } from "@/app/components/ui/Card";

export function OwnerActionsPanel({ onRepay }: { onRepay: () => void }) {
  return (
    <Card className="space-y-3" role="region" aria-label="Owner actions">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{STRINGS.ownerRepayNow}</h3>
        <p className="text-xs text-secondary-text">Repay the outstanding amount to unlock collateral and close the request.</p>
      </div>
      <Button type="button" onClick={onRepay} className="gap-2 w-full sm:w-auto">
        {STRINGS.ownerRepayNow}
      </Button>
    </Card>
  );
}
