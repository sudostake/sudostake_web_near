"use client";

import React from "react";
import { Button } from "@/app/components/ui/Button";
import { STRINGS, storageDepositString } from "@/utils/strings";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { Card } from "@/app/components/ui/Card";

type Props = {
  ownerMinDeposit: string | null;
  storagePending: boolean;
  onRegister: () => void;
  tokenId?: string | null;
  network: Network;
  storageError?: string | null;
};

export function OwnerVaultRegistrationCard({ ownerMinDeposit, storagePending, onRegister, tokenId, network, storageError }: Props) {
  return (
    <Card className="space-y-3 border border-amber-400/40 bg-amber-50/70 text-amber-900" role="region" aria-label="Vault registration">
      <div className="text-sm font-semibold">{STRINGS.vaultRegistrationRequiredTitle}</div>
      <p className="text-sm">
        {STRINGS.vaultRegistrationRequiredOwnerBody}
        {ownerMinDeposit && <> {storageDepositString(ownerMinDeposit)}</>}
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <Button
          type="button"
          onClick={onRegister}
          disabled={storagePending || !ownerMinDeposit}
          className="w-full justify-center gap-2 sm:w-auto"
          aria-busy={storagePending ? true : undefined}
        >
          {storagePending ? "Registering…" : STRINGS.registerVaultWithToken}
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
        {storageError && <div className="text-xs text-red-600">{storageError}</div>}
      </div>
    </Card>
  );
}
