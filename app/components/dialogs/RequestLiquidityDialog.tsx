"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useRequestLiquidity } from "@/hooks/useRequestLiquidity";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveNetwork, getActiveFactoryId } from "@/utils/networks";
import { getDefaultUsdcTokenId } from "@/utils/tokens";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { utils } from "near-api-js";

type Props = {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  onSuccess?: () => void;
};

export function RequestLiquidityDialog({ open, onClose, vaultId, onSuccess }: Props) {
  const { requestLiquidity, pending, error } = useRequestLiquidity();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();
  const network = getActiveNetwork();
  const { data: delegData } = useVaultDelegations(factoryId, vaultId);

  // Compute max collateral from total staked balance across validators
  const maxCollateralYocto = useMemo(() => {
    const summary = delegData?.summary ?? [];
    let total = BigInt(0);
    for (const s of summary) {
      // Accumulate as BigInt and convert once at the end
      total += BigInt(s.staked_balance.minimal ?? "0");
    }
    return total.toString();
  }, [delegData]);

  const maxCollateralNear = useMemo(() => {
    try {
      return utils.format.formatNearAmount(maxCollateralYocto);
    } catch {
      return "0";
    }
  }, [maxCollateralYocto]);

  const [token, setToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [interestToken, setInterestToken] = useState<string>("");
  const [collateralNear, setCollateralNear] = useState<string>("");
  const [durationDays, setDurationDays] = useState<string>("7");

  useEffect(() => {
    if (!token) {
      const usdc = getDefaultUsdcTokenId(network);
      if (usdc) setToken(usdc);
    }
  }, [network, token]);

  const resetAndClose = () => {
    setAmount("");
    setCollateralNear("");
    setDurationDays("7");
    setInterestToken("");
    onClose();
  };

  const collateralWithinMax = useMemo(() => {
    if (!collateralNear) return false;
    try {
      const inputYocto = utils.format.parseNearAmount(collateralNear);
      if (!inputYocto) return false;
      return BigInt(inputYocto) <= BigInt(maxCollateralYocto);
    } catch {
      return false;
    }
  }, [collateralNear, maxCollateralYocto]);

  const hasToken = Boolean(token);
  const hasValidAmount = Number(amount) > 0;
  const hasValidInterestToken = Number(interestToken) >= 0;
  const hasValidCollateral = Number(collateralNear) > 0;
  const hasValidDuration = Number(durationDays) > 0;
  const canSubmit = Boolean(
    hasToken &&
    hasValidAmount &&
    hasValidInterestToken &&
    hasValidCollateral &&
    hasValidDuration &&
    collateralWithinMax
  );

  const showCollateralError = Boolean(collateralNear) && !collateralWithinMax;

  const clampCollateral = (next: string) => {
    // If parsed value exceeds max, clamp to max
    try {
      const yo = utils.format.parseNearAmount(next || "0");
      if (!yo) return setCollateralNear(next);
      if (BigInt(yo) > BigInt(maxCollateralYocto)) {
        setCollateralNear(maxCollateralNear);
      } else {
        setCollateralNear(next);
      }
    } catch {
      setCollateralNear(next);
    }
  };

  const confirm = async () => {
    try {
      const { txHash } = await requestLiquidity({
        vault: vaultId,
        token,
        amount,
        interest: interestToken,
        collateral_near: collateralNear,
        duration_days: Number(durationDays || 0),
      });
      await indexVault({ factoryId, vault: vaultId, txHash });
      if (onSuccess) onSuccess();
    } catch {
      // handled by hook error state
    } finally {
      resetAndClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Open liquidity request"
      disableBackdropClose={pending}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded border py-2 px-3 bg-surface hover:bg-surface/90"
            onClick={resetAndClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-primary text-primary-text py-2 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!canSubmit || pending}
            onClick={confirm}
          >
            {pending ? "Submitting..." : "Continue"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="text-sm text-secondary-text">
          Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        <label className="block text-sm">
          <span className="text-secondary-text">Token (NEP-141)</span>
          <input
            type="text"
            placeholder="e.g. usdc.tkn.primitives.testnet"
            className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-secondary-text">Amount (token)</span>
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0.0"
              className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-secondary-text">Interest (token)</span>
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="e.g. 1.25"
              className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
              value={interestToken}
              onChange={(e) => setInterestToken(e.target.value)}
            />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-secondary-text">Collateral (NEAR)</span>
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0.0"
              className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
              value={collateralNear}
              onChange={(e) => clampCollateral(e.target.value)}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-secondary-text">
              <span>Max available (staked): {maxCollateralNear} NEAR</span>
              <button
                type="button"
                className="underline disabled:opacity-50"
                onClick={() => setCollateralNear(maxCollateralNear)}
                disabled={maxCollateralYocto === "0"}
              >
                Max
              </button>
            </div>
          </label>
          <label className="block text-sm">
            <span className="text-secondary-text">Duration (days)</span>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="7"
              className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            />
          </label>
        </div>
        {showCollateralError && (
          <div className="text-xs text-red-500">Collateral exceeds your total staked balance.</div>
        )}
        {error && (
          <div className="text-xs text-red-500">{error}</div>
        )}
      </div>
    </Modal>
  );
}
