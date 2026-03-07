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

type ViewerRoleInput = {
  signedAccountId?: string | null;
  owner?: string | null;
  lender?: string | null;
};

export function getViewerRole({ signedAccountId, owner, lender }: ViewerRoleInput): ViewerRole {
  if (!signedAccountId) return "guest";
  if (lender && lender === signedAccountId) return "activeLender";
  if (owner && owner === signedAccountId) return "owner";
  return "potentialLender";
}

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

  const role: ViewerRole = useMemo(
    () =>
      getViewerRole({
        signedAccountId,
        owner: data?.owner,
        lender: data?.accepted_offer?.lender,
      }),
    [signedAccountId, data?.owner, data?.accepted_offer?.lender]
  );

  const isOwner = role === "owner";
  const isActiveLender = role === "activeLender";

  return { role, isOwner, isActiveLender, loading, error };
}
