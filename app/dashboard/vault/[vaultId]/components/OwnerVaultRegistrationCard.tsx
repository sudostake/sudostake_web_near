"use client";

import React from "react";
import { Button } from "@/app/components/ui/Button";
import { STRINGS, storageDepositString } from "@/utils/strings";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";

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
    <div className="mt-3 rounded border border-amber-500/30 bg-amber-100/40 text-amber-900 p-3 text-sm dark:border-foreground/20 dark:bg-background/70 dark:text-foreground">
      <div className="font-medium">{STRINGS.vaultRegistrationRequiredTitle}</div>
      <div className="mt-1">
        {STRINGS.vaultRegistrationRequiredOwnerBody}
        {ownerMinDeposit && (
          <>
            {" "}{storageDepositString(ownerMinDeposit)}
          </>
        )}
      </div>
      <div className="mt-2">
        <Button
          type="button"
          onClick={onRegister}
          disabled={storagePending || !ownerMinDeposit}
          variant="primary"
          size="md"
          className="gap-2"
          aria-busy={storagePending ? true : undefined}
        >
          {storagePending ? "Registering…" : STRINGS.registerVaultWithToken}
        </Button>
        {storagePending && (
          <div className="sr-only" role="status" aria-live="polite">Registering…</div>
        )}
        {tokenId && (
          <a
            href={explorerAccountUrl(network, tokenId)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 inline-flex items-center text-primary underline"
            aria-label={`View token ${tokenId} on explorer`}
          >
            {STRINGS.viewTokenOnExplorer}
          </a>
        )}
        <a
          href="/docs/token-registration"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-3 inline-flex items-center text-primary underline"
        >
          {STRINGS.learnMore}
        </a>
        {storageError && <div className="mt-2 text-xs text-red-600">{storageError}</div>}
      </div>
    </div>
  );
}
