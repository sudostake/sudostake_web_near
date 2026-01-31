"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useRequestLiquidity } from "@/hooks/useRequestLiquidity";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveNetwork, getActiveFactoryId, explorerAccountUrl } from "@/utils/networks";
import { getDefaultUsdcTokenId, getTokenConfigById } from "@/utils/tokens";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { utils } from "near-api-js";
import { useFtStorage } from "@/hooks/useFtStorage";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { Badge } from "@/app/components/ui/Badge";

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

  const [amount, setAmount] = useState<string>("");
  const [interestToken, setInterestToken] = useState<string>("");
  const [collateralNear, setCollateralNear] = useState<string>("");
  const [durationDays, setDurationDays] = useState<string>("7");

  const token = useMemo(() => getDefaultUsdcTokenId(network) ?? "", [network]);
  const tokenConfig = useMemo(
    () => (token ? getTokenConfigById(token, network) : undefined),
    [token, network]
  );
  const tokenSymbol = tokenConfig?.symbol ?? "FT";
  const tokenName = tokenConfig?.name ?? "Token";
  const tokenDecimals = tokenConfig?.decimals ?? 6;

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
        const registered = bal !== null;
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
    isRegistered
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
      const registered = bal !== null;
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
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-secondary-text">Vault</div>
            <div className="mt-1 text-sm font-medium text-foreground break-all" title={vaultId}>{vaultId}</div>
          </div>
          <Badge variant="neutral" className="uppercase">{network}</Badge>
        </div>

        <section className="rounded border bg-background p-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-secondary-text">Token (fixed)</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{tokenSymbol}</span>
                <span className="text-xs text-secondary-text">{tokenName}</span>
                <Badge variant="info">Fixed</Badge>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-secondary-text mb-1">Token contract</div>
            <div className="flex items-center justify-between gap-2 rounded border bg-background px-3 h-10">
              <div className="truncate" title={token || undefined}>{token || "Not configured"}</div>
              {token && <CopyButton value={token} title="Copy token id" />}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-text">
            <span>This request is fixed to {tokenSymbol} on {network.toUpperCase()}.</span>
            {token && (
              <a
                href={explorerAccountUrl(network, token)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                View token on Explorer
              </a>
            )}
          </div>
        </section>

        <section className="rounded border bg-background p-3">
          <div className="text-sm font-medium">Loan terms</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={`Amount (${tokenSymbol})`}
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              hint={`How much ${tokenSymbol} you want to borrow. Up to ${tokenDecimals} decimals.`}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label={`Interest (${tokenSymbol})`}
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="e.g. 1.25"
              value={interestToken}
              hint={`Total interest in ${tokenSymbol} to repay.`}
              onChange={(e) => setInterestToken(e.target.value)}
            />
          </div>
        </section>

        <section className="rounded border bg-background p-3">
          <div className="text-sm font-medium">Collateral & duration</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
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
              </label>
              <div className="mt-1 flex items-center justify-between text-xs text-secondary-text">
                <span>Max available (staked): {maxCollateralNear} NEAR</span>
                <Button variant="ghost" size="sm" onClick={() => setCollateralNear(maxCollateralNear)} disabled={maxCollateralYocto === "0"}>
                  Max
                </Button>
              </div>
              {showCollateralError && (
                <div className="mt-1 text-xs text-red-500">Collateral exceeds your total staked balance.</div>
              )}
            </div>
            <Input
              label="Duration (days)"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              placeholder="7"
              value={durationDays}
              hint="How long this request should remain open."
              onChange={(e) => setDurationDays(e.target.value)}
            />
          </div>
        </section>

        <section className="rounded border bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Token registration</div>
            {checkingRegistration ? (
              <Badge variant="neutral">Checking</Badge>
            ) : isRegistered ? (
              <Badge variant="success">Registered</Badge>
            ) : (
              <Badge variant="warn">Action required</Badge>
            )}
          </div>
          <div className="mt-2 text-sm text-secondary-text">
            {checkingRegistration
              ? "Checking whether the vault is registered with the token contract."
              : isRegistered
                ? `Your vault is registered and can receive ${tokenSymbol}.`
                : "Your vault must be registered with the token contract before it can receive funds."}
            {!isRegistered && minStorageDeposit && (
              <> This requires a one-time storage deposit of {utils.format.formatNearAmount(minStorageDeposit)} NEAR.</>
            )}
          </div>
          {!isRegistered && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button onClick={onRegister} disabled={regPending || checkingRegistration || !minStorageDeposit} aria-busy={regPending ? true : undefined}>
                {regPending ? "Registering…" : "Register vault"}
              </Button>
              {regPending && (
                <div className="sr-only" role="status" aria-live="polite">Registering…</div>
              )}
              <a
                href="/docs/token-registration"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                Learn more
              </a>
              {regError && <div className="text-xs text-red-600">{regError}</div>}
            </div>
          )}
        </section>

        <section className="rounded border bg-background p-3">
          <div className="text-sm font-medium">Review</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-secondary-text">Token</span>
              <span>{tokenSymbol}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-secondary-text">Amount</span>
              <span>{amount || "—"} {tokenSymbol}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-secondary-text">Interest</span>
              <span>{interestToken || "—"} {tokenSymbol}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-secondary-text">Collateral</span>
              <span>{collateralNear || "—"} NEAR</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-secondary-text">Duration</span>
              <span>{durationDays || "—"} days</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-secondary-text">
            You’ll review and approve this request in your wallet.
          </div>
        </section>

        {error && (
          <div className="text-xs text-red-500">{error}</div>
        )}
      </div>
    </Modal>
  );
}
