"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useRequestLiquidity } from "@/hooks/useRequestLiquidity";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveNetwork, getActiveFactoryId, explorerAccountUrl } from "@/utils/networks";
import { getDefaultUsdcTokenId } from "@/utils/tokens";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { utils } from "near-api-js";
import { useFtStorage } from "@/hooks/useFtStorage";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

type Props = {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  onSuccess?: () => void;
  disabledReason?: string | null;
};

export function RequestLiquidityDialog({ open, onClose, vaultId, onSuccess, disabledReason = null }: Props) {
  const { requestLiquidity, pending, error } = useRequestLiquidity();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();
  const network = getActiveNetwork();
  const { data: delegData, refetch: refetchDelegations } = useVaultDelegations(factoryId, vaultId);
  const { storageBalanceOf, storageBounds, registerStorage, pending: regPending, error: regError } = useFtStorage();
  const [isRegistered, setIsRegistered] = useState<boolean>(true);
  const [minStorageDeposit, setMinStorageDeposit] = useState<string | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

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

  // Ensure delegation data is fresh whenever the dialog is opened.
  useEffect(() => {
    if (open) {
      refetchDelegations();
    }
  }, [open, refetchDelegations]);

  // While the dialog is open, keep delegations in sync by refetching on window focus.
  useEffect(() => {
    if (!open) return;
    const onFocus = () => refetchDelegations();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [open, refetchDelegations]);

  // Check FT storage registration for the vault on selected token
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!token) {
        setIsRegistered(true);
        setMinStorageDeposit(null);
        return;
      }
      setCheckingRegistration(true);
      try {
        const bal = await storageBalanceOf(token, vaultId);
        if (cancelled) return;
        const registered = !!(bal && typeof bal.total === "string" && bal.total !== "0");
        setIsRegistered(registered);
        if (!registered) {
          const bounds = await storageBounds(token);
          if (cancelled) return;
          setMinStorageDeposit(bounds?.min ?? null);
        } else {
          setMinStorageDeposit(null);
        }
      } finally {
        if (!cancelled) setCheckingRegistration(false);
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [token, vaultId, storageBalanceOf, storageBounds]);

  const resetAndClose = () => {
    setAmount("");
    setCollateralNear("");
    setDurationDays("7");
    setInterestToken("");
    onClose();
  };

  const hasCollateralInput = collateralNear.trim().length > 0;
  // Check strictly whether the provided collateral is within the staked max.
  // Empty input is handled separately via hasCollateralInput.
  const isCollateralWithinMax = useMemo(() => {
    if (!hasCollateralInput) return true;
    try {
      const inputYocto = utils.format.parseNearAmount(collateralNear);
      if (inputYocto === null) return false;
      return BigInt(inputYocto) <= BigInt(maxCollateralYocto);
    } catch {
      return false;
    }
  }, [hasCollateralInput, collateralNear, maxCollateralYocto]);

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
    isCollateralWithinMax &&
    isRegistered &&
    !disabledReason
  );

  const showCollateralError = hasCollateralInput && !isCollateralWithinMax;

  const clampCollateral = (next: string) => {
    // If parsed value exceeds max, clamp to max
    try {
      const yo = utils.format.parseNearAmount(next || "0");
      if (yo === null) return setCollateralNear(next);
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
      resetAndClose();
    } catch {
      // handled by hook error state; keep dialog open to allow corrections
    }
  };

  const onRegister = async () => {
    if (!token || !minStorageDeposit) return;
    try {
      await registerStorage(token, vaultId, minStorageDeposit);
      // Re-check
      const bal = await storageBalanceOf(token, vaultId);
      const registered = !!(bal && typeof bal.total === "string" && bal.total !== "0");
      setIsRegistered(registered);
    } catch {
      // regError handled in hook
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
          <Button variant="secondary" onClick={resetAndClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={!canSubmit || pending}>
            {pending ? "Submitting..." : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="text-sm text-secondary-text">
          Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        <Input
          label="Token (NEP-141)"
          type="text"
          placeholder="e.g. usdc.tkn.primitives.testnet"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Amount (token)"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="Interest (token)"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            placeholder="e.g. 1.25"
            value={interestToken}
            onChange={(e) => setInterestToken(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-secondary-text">Collateral (NEAR)</span>
            <Input
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="0.0"
              value={collateralNear}
              onChange={(e) => clampCollateral(e.target.value)}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-secondary-text">
              <span>Max available (staked): {maxCollateralNear} NEAR</span>
              <Button variant="ghost" size="sm" onClick={() => setCollateralNear(maxCollateralNear)} disabled={maxCollateralYocto === "0"}>
                Max
              </Button>
            </div>
          </label>
          <Input
            label="Duration (days)"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="7"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
          />
        </div>
        {!isRegistered && (
          <div className="rounded border border-amber-500/30 bg-amber-100/40 text-amber-900 p-3 text-sm">
            <div className="font-medium">Registration required</div>
            <div className="mt-1">
              Your vault must be registered with the token contract before it can receive funds via ft_transfer_call.
              {" "}
              {minStorageDeposit && (
                <>
                  This requires a one-time storage deposit of {utils.format.formatNearAmount(minStorageDeposit)} NEAR to the token contract.
                </>
              )}
            </div>
            <div className="mt-2">
              <Button onClick={onRegister} disabled={regPending || checkingRegistration || !minStorageDeposit} aria-busy={regPending ? true : undefined}>
                {regPending ? "Registering…" : "Register vault with token"}
              </Button>
              {regPending && (
                <div className="sr-only" role="status" aria-live="polite">Registering…</div>
              )}
              {token && (
                <a
                  href={explorerAccountUrl(network, token)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 inline-flex items-center text-primary underline"
                  aria-label={`View token ${token} on explorer`}
                >
                  View token on Explorer
                </a>
              )}
              <a
                href="/docs/token-registration"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 inline-flex items-center text-primary underline"
              >
                Learn more
              </a>
              {regError && <div className="mt-2 text-xs text-red-600">{regError}</div>}
            </div>
          </div>
        )}
        {showCollateralError && (
          <div className="text-xs text-red-500">Collateral exceeds your total staked balance.</div>
        )}
        {error && (
          <div className="text-xs text-red-500">{error}</div>
        )}
        {disabledReason && (
          <div className="text-xs text-amber-600" role="alert">
            {disabledReason}
          </div>
        )}
      </div>
    </Modal>
  );
}
