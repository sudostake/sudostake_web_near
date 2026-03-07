"use client";

import Big from "big.js";
import React, { useEffect, useMemo, useState } from "react";
import { utils } from "near-api-js";
import { Modal } from "@/app/components/dialogs/Modal";
import { useRequestLiquidity } from "@/hooks/useRequestLiquidity";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId, getActiveNetwork } from "@/utils/networks";
import { getDefaultUsdcTokenId, getTokenConfigById } from "@/utils/tokens";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { useFtStorage } from "@/hooks/useFtStorage";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { SECONDS_PER_DAY } from "@/utils/constants";
import { calculateApr } from "@/utils/finance";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { formatDays } from "@/utils/time";

type Props = {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  onSuccess?: () => void;
};

const STEP_ITEMS = [
  "Borrow amount",
  "Repayment window",
  "Lender fee",
  "Collateral",
  "Review",
] as const;

function isDecimalAmount(value: string, allowZero: boolean) {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d*)?$/.test(trimmed)) return false;
  try {
    const parsed = new Big(trimmed);
    return allowZero ? parsed.gte(0) : parsed.gt(0);
  } catch {
    return false;
  }
}

function isWholeDays(value: string) {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0;
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="text-sm text-secondary-text">{label}</div>
      <div className="text-right text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function RequestLiquidityDialog({ open, onClose, vaultId, onSuccess }: Props) {
  const { requestLiquidity, pending, error } = useRequestLiquidity();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();
  const network = getActiveNetwork();
  const { data: delegData, refetch: refetchDelegations } = useVaultDelegations(factoryId, vaultId);
  const { storageBalanceOf, storageBounds, registerStorage, pending: regPending, error: regError } = useFtStorage();

  const [currentStep, setCurrentStep] = useState(0);
  const [amount, setAmount] = useState("");
  const [interestToken, setInterestToken] = useState("0");
  const [collateralNear, setCollateralNear] = useState("");
  const [durationDays, setDurationDays] = useState("7");
  const [isRegistered, setIsRegistered] = useState(true);
  const [minStorageDeposit, setMinStorageDeposit] = useState<string | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  const maxCollateralYocto = useMemo(() => {
    const summary = delegData?.summary ?? [];
    let total = BigInt(0);
    for (const item of summary) {
      total += BigInt(item.staked_balance.minimal ?? "0");
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

  const displayMaxCollateralNear = useMemo(
    () => safeFormatYoctoNear(maxCollateralYocto, 5),
    [maxCollateralYocto]
  );

  const token = useMemo(() => getDefaultUsdcTokenId(network) ?? "", [network]);
  const tokenConfig = useMemo(
    () => (token ? getTokenConfigById(token, network) : undefined),
    [network, token]
  );
  const tokenSymbol = tokenConfig?.symbol ?? "FT";

  useEffect(() => {
    if (!open) return;
    setCurrentStep(0);
    refetchDelegations();
  }, [open, refetchDelegations]);

  useEffect(() => {
    if (!open) return;
    const onFocus = () => refetchDelegations();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [open, refetchDelegations]);

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
        const balance = await storageBalanceOf(token, vaultId);
        if (cancelled) return;
        const registered = balance !== null;
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
  }, [storageBalanceOf, storageBounds, token, vaultId]);

  const hasToken = Boolean(token);
  const hasDelegatedCollateral = maxCollateralYocto !== "0";
  const hasValidAmount = isDecimalAmount(amount, false);
  const hasValidInterestToken = isDecimalAmount(interestToken, true);
  const hasValidCollateral = isDecimalAmount(collateralNear, false);
  const hasValidDuration = isWholeDays(durationDays);
  const hasCollateralInput = collateralNear.trim().length > 0;

  const isCollateralWithinMax = useMemo(() => {
    if (!hasCollateralInput) return true;
    try {
      const inputYocto = utils.format.parseNearAmount(collateralNear);
      if (inputYocto === null) return false;
      return BigInt(inputYocto) <= BigInt(maxCollateralYocto);
    } catch {
      return false;
    }
  }, [collateralNear, hasCollateralInput, maxCollateralYocto]);

  const isCollateralStepValid = hasValidCollateral && isCollateralWithinMax && hasDelegatedCollateral;
  const closeDisabled = pending || regPending;
  const durationSeconds = hasValidDuration ? Number(durationDays) * SECONDS_PER_DAY : 0;

  const totalRepayment = useMemo(() => {
    if (!hasValidAmount || !hasValidInterestToken) return "—";
    try {
      return new Big(amount).plus(new Big(interestToken)).toString();
    } catch {
      return "—";
    }
  }, [amount, hasValidAmount, hasValidInterestToken, interestToken]);

  const estimatedApr = useMemo(() => {
    if (!hasValidAmount || !hasValidInterestToken || durationSeconds <= 0) return "—";
    try {
      const aprPct = calculateApr(interestToken, amount, durationSeconds).times(100);
      return `${aprPct.round(2, 0).toString()}%`;
    } catch {
      return "—";
    }
  }, [amount, durationSeconds, hasValidAmount, hasValidInterestToken, interestToken]);

  const showCollateralError = hasCollateralInput && !isCollateralWithinMax;
  const isReviewStep = currentStep === STEP_ITEMS.length - 1;
  const currentStepTitle = STEP_ITEMS[currentStep];
  const isSubmitStepValid =
    hasToken &&
    hasValidAmount &&
    hasValidDuration &&
    hasValidInterestToken &&
    isCollateralStepValid &&
    !checkingRegistration &&
    isRegistered;
  const registrationStatus = checkingRegistration
    ? "Checking..."
    : isRegistered
      ? "Ready"
      : "Registration required";
  const storageDepositAmount = minStorageDeposit ? utils.format.formatNearAmount(minStorageDeposit) : null;

  const resetForm = () => {
    setCurrentStep(0);
    setAmount("");
    setInterestToken("0");
    setCollateralNear("");
    setDurationDays("7");
  };

  const handleClose = () => {
    if (closeDisabled) return;
    resetForm();
    onClose();
  };

  const clampCollateral = (next: string) => {
    try {
      const yocto = utils.format.parseNearAmount(next || "0");
      if (yocto === null) {
        setCollateralNear(next);
        return;
      }
      if (BigInt(yocto) > BigInt(maxCollateralYocto)) {
        setCollateralNear(maxCollateralNear);
        return;
      }
      setCollateralNear(next);
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
        duration_days: Number(durationDays),
      });
      await indexVault({ factoryId, vault: vaultId, txHash });
      onSuccess?.();
      resetForm();
      onClose();
    } catch {
      // Hook state surfaces the error.
    }
  };

  const onRegister = async () => {
    if (!token || !minStorageDeposit) return;
    try {
      await registerStorage(token, vaultId, minStorageDeposit);
      const balance = await storageBalanceOf(token, vaultId);
      setIsRegistered(balance !== null);
    } catch {
      // Storage hook surfaces the error.
    }
  };

  const currentStepValid =
    currentStep === 0
      ? hasToken && hasValidAmount
      : currentStep === 1
        ? hasValidDuration
        : currentStep === 2
          ? hasValidInterestToken
          : currentStep === 3
            ? isCollateralStepValid
            : isSubmitStepValid;

  const handlePrimaryAction = () => {
    if (currentStep < STEP_ITEMS.length - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }
    void confirm();
  };

  const primaryLabel =
    isReviewStep
      ? pending
        ? "Submitting..."
        : checkingRegistration
          ? "Checking..."
          : "Submit request"
      : currentStep === STEP_ITEMS.length - 2
        ? "Review"
        : "Continue";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Request liquidity"
      disableBackdropClose={closeDisabled}
      panelClassName="max-w-xl"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                onClick={() => setCurrentStep((step) => step - 1)}
                disabled={closeDisabled}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
            )}
            <Button variant="secondary" onClick={handleClose} disabled={closeDisabled} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
          <Button onClick={handlePrimaryAction} disabled={closeDisabled || !currentStepValid} className="w-full sm:w-auto sm:min-w-[12rem]">
            {primaryLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-secondary-text">
            Step {currentStep + 1} of {STEP_ITEMS.length}
          </div>
          <h4 className="text-xl font-semibold text-foreground">{currentStepTitle}</h4>
        </div>

        {currentStep === 0 && (
          <section className="space-y-4">
            {!hasToken && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                A default loan token is not configured for this network yet.
              </div>
            )}
            <Input
              label="Amount"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              suffix={tokenSymbol}
            />
          </section>
        )}

        {currentStep === 1 && (
          <section className="space-y-4">
            <Input
              label="Days"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              placeholder="7"
              value={durationDays}
              onChange={(event) => setDurationDays(event.target.value)}
              suffix="days"
            />
          </section>
        )}

        {currentStep === 2 && (
          <section className="space-y-4">
            <Input
              label="Fee"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="0.0"
              value={interestToken}
              onChange={(event) => setInterestToken(event.target.value)}
              suffix={tokenSymbol}
            />
            <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-secondary-text">Repayment</span>
                <span className="font-semibold text-foreground">
                  {totalRepayment === "—" ? "—" : `${totalRepayment} ${tokenSymbol}`}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-secondary-text">APR</span>
                <span className="font-semibold text-foreground">{estimatedApr}</span>
              </div>
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
              <span className="text-secondary-text">Available</span>
              <span className="font-semibold text-foreground">{displayMaxCollateralNear} NEAR</span>
            </div>
            {hasDelegatedCollateral && (
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCollateralNear(maxCollateralNear)}
                >
                  Use max
                </Button>
              </div>
            )}
            <Input
              label="NEAR collateral"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="0.0"
              value={collateralNear}
              onChange={(event) => clampCollateral(event.target.value)}
              suffix="NEAR"
            />
            {showCollateralError && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600">
                Collateral exceeds delegated NEAR.
              </div>
            )}
            {!hasDelegatedCollateral && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                Delegate NEAR before continuing.
              </div>
            )}
          </section>
        )}

        {currentStep === 4 && (
          <section className="space-y-4">
            <div className="divide-y divide-[color:var(--panel-border)] rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--surface)]">
              <ReviewRow label="Borrow amount" value={hasValidAmount ? `${amount} ${tokenSymbol}` : "—"} />
              <ReviewRow label="Repayment window" value={hasValidDuration ? formatDays(Number(durationDays)) : "—"} />
              <ReviewRow label="Lender fee" value={hasValidInterestToken ? `${interestToken} ${tokenSymbol}` : "—"} />
              <ReviewRow label="Total repayment" value={totalRepayment === "—" ? "—" : `${totalRepayment} ${tokenSymbol}`} />
              <ReviewRow label="Estimated APR" value={estimatedApr} />
              <ReviewRow label="Collateral" value={hasValidCollateral ? `${collateralNear} NEAR` : "—"} />
              <ReviewRow label="Vault status" value={registrationStatus} />
            </div>

            {!isRegistered && (
              <div className="space-y-3 rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--surface)] p-4">
                <div className="text-sm text-secondary-text">
                  Register this vault to receive {tokenSymbol}.
                  {storageDepositAmount && (
                    <>
                      {" "}
                      One-time deposit: <span className="font-semibold text-foreground">{storageDepositAmount} NEAR</span>.
                    </>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={onRegister} disabled={regPending || checkingRegistration || !minStorageDeposit}>
                    {regPending ? "Registering..." : "Register vault"}
                  </Button>
                  {regError && (
                    <div className="text-sm text-red-600" role="alert">
                      {regError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
