"use client";

import { useMemo } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { useVault } from "@/hooks/useVault";

export type ViewerRole = "owner" | "activeLender" | "potentialLender" | "guest";

export type UseViewerRoleResult = {
  role: ViewerRole;
  isOwner: boolean;
  isActiveLender: boolean;
  loading: boolean;
  error: string | null;
};

/**
 * Determine the viewer's role relative to a given vault, derived from on-chain indexed state.
 *
 * Roles:
 * - guest: no connected wallet
 * - owner: connected wallet matches vault owner
 * - activeLender: connected wallet matches accepted offer lender
 * - potentialLender: connected wallet, but neither owner nor active lender
 */
export function useViewerRole(
  factoryId?: string | null,
  vaultId?: string | null
): UseViewerRoleResult {
  const { signedAccountId } = useWalletSelector();
  const { data, loading, error } = useVault(factoryId ?? undefined, vaultId ?? undefined);

  const role: ViewerRole = useMemo(() => {
    if (!signedAccountId) return "guest";
    const owner = data?.owner;
    const lender = data?.accepted_offer?.lender;
    if (signedAccountId && lender && lender === signedAccountId) return "activeLender";
    if (signedAccountId && owner && owner === signedAccountId) return "owner";
    return "potentialLender";
  }, [signedAccountId, data?.owner, data?.accepted_offer?.lender]);

  const isOwner = role === "owner";
  const isActiveLender = role === "activeLender";

  return { role, isOwner, isActiveLender, loading, error };
}

