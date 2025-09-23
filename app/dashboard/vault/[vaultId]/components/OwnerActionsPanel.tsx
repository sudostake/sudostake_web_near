"use client";

import React from "react";
import { Button } from "@/app/components/ui/Button";
import { STRINGS } from "@/utils/strings";

export function OwnerActionsPanel({ onRepay }: { onRepay: () => void }) {
  return (
    <div className="mt-2 text-sm">
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="gap-2 w-full sm:w-auto"
        onClick={onRepay}
      >
        {STRINGS.ownerRepayNow}
      </Button>
    </div>
  );
}
