"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { Button } from "@/app/components/ui/Button";
import { STRINGS, storageDepositString } from "@/utils/strings";

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
    <div className="text-left text-sm text-amber-800 bg-amber-100/60 border border-amber-500/30 rounded p-2">
      <div>
        {STRINGS.mustRegisterAccountBeforeAccept}
        {lenderMinDeposit && (
          <>
            {" "}{storageDepositString(lenderMinDeposit)}
          </>
        )}
      </div>
      <div className="mt-2">
        <Button
          type="button"
          onClick={onRegister}
          disabled={storagePending || !lenderMinDeposit}
          variant="secondary"
          size="sm"
          className="gap-2"
          aria-busy={storagePending ? true : undefined}
        >
          {STRINGS.registerAccountWithToken}
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
        {storageError && <div className="mt-1 text-xs text-red-600 dark:text-red-300">{storageError}</div>}
      </div>
    </div>
  );
}
