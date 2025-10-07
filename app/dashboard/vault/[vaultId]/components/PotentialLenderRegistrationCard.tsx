"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { Button } from "@/app/components/ui/Button";
import { STRINGS, storageDepositString } from "@/utils/strings";
import { Card } from "@/app/components/ui/Card";

type Props = {
  network: Network;
  tokenId?: string | null;
  lenderRegistered: boolean | null;
  lenderMinDeposit: string | null;
  storagePending: boolean;
  storageError?: string | null;
  onRegister: () => void;
};

export function PotentialLenderRegistrationCard({
  network,
  tokenId,
  lenderRegistered,
  lenderMinDeposit,
  storagePending,
  storageError,
  onRegister,
}: Props) {
  if (lenderRegistered !== false) return null;
  return (
    <Card className="space-y-3 border border-amber-400/40 bg-amber-50/70 text-amber-900" role="region" aria-label="Register account">
      <p className="text-sm">
        {STRINGS.mustRegisterAccountBeforeAccept}
        {lenderMinDeposit && <> {storageDepositString(lenderMinDeposit)}</>}
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <Button
          type="button"
          onClick={onRegister}
          disabled={storagePending || !lenderMinDeposit}
          variant="secondary"
          className="w-full justify-center gap-2 sm:w-auto"
          aria-busy={storagePending ? true : undefined}
        >
          {STRINGS.registerAccountWithToken}
        </Button>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {tokenId && (
            <a
              href={explorerAccountUrl(network, tokenId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
              aria-label={`View token ${tokenId} on explorer`}
            >
              {STRINGS.viewTokenOnExplorer}
            </a>
          )}
          <a href="/docs/token-registration" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            {STRINGS.learnMore}
          </a>
        </div>
        {storagePending && (
          <div className="sr-only" role="status" aria-live="polite">
            Registering…
          </div>
        )}
        {storageError && <div className="text-xs text-red-600">{storageError}</div>}
      </div>
    </Card>
  );
}
