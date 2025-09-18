"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useAvailableBalance } from "@/hooks/useAvailableBalance";
import { useWithdraw } from "@/hooks/useWithdraw";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId, getActiveNetwork } from "@/utils/networks";
import { parseNumber } from "@/utils/format";
import { MaxAvailable } from "@/app/components/MaxAvailable";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { useAccountFtBalance } from "@/hooks/useAccountFtBalance";
import { getDefaultUsdcTokenId, getTokenDecimals } from "@/utils/tokens";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { useTokenRegistration } from "@/hooks/useTokenRegistration";
import { useFtStorage } from "@/hooks/useFtStorage";
import { Balance } from "@/utils/balance";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { AssetToggle } from "@/app/components/ui/AssetToggle";

function isRequestedTokenWithdrawalBlocked(
  state: "idle" | "pending" | "active" | undefined,
  requestToken: string | null | undefined,
  targetTokenId: string | null | undefined
): boolean {
  return state === "pending" && !!requestToken && !!targetTokenId && requestToken === targetTokenId;
}

export function WithdrawDialog({
  open,
  onClose,
  vaultId,
  onSuccess,
  state,
  requestToken,
  liquidationActive = false,
  refundsCount,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  onSuccess?: () => void;
  state?: "idle" | "pending" | "active";
  requestToken?: string | null;
  liquidationActive?: boolean;
  refundsCount?: number | null;
}) {
  const [amount, setAmount] = useState<string>("");
  const [kind, setKind] = useState<"NEAR" | "USDC">("NEAR");
  const { balance: availBalance, loading: availLoading } = useAvailableBalance(vaultId);
  const { withdraw, pending: withdrawing, error: withdrawError } = useWithdraw();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();
  const network = getActiveNetwork();
  const usdcId = getDefaultUsdcTokenId(network);
  const usdcDecimals = useMemo(() => (usdcId ? getTokenDecimals(usdcId, network) : 6), [usdcId, network]);
  const { balance: vaultUsdc, loading: usdcLoading } = useAccountFtBalance(vaultId, usdcId, "USDC", network);
  const { signedAccountId } = useWalletSelector();
  const { registered: ownerRegistered, minDeposit: ownerMinDeposit, loading: regLoading, refresh: refreshReg } =
    useTokenRegistration(usdcId ?? null, signedAccountId ?? null);
  const { registerStorage, pending: storagePending } = useFtStorage();

  // If liquidation is active, default to USDC since NEAR is disallowed
  useEffect(() => {
    if (open && liquidationActive && usdcId) setKind("USDC");
  }, [open, liquidationActive, usdcId]);

  const amountNum = Number(amount);
  const withdrawAvailableNum = useMemo(() => {
    if (kind === "NEAR") return parseNumber(availBalance.toDisplay());
    const disp = vaultUsdc?.toDisplay();
    return parseNumber(disp ?? "0");
  }, [kind, availBalance, vaultUsdc]);

  // Compute permission matrix mirroring contract's ensure_owner_can_withdraw
  const canWithdrawNear = useMemo(() => {
    if ((refundsCount ?? 0) > 0) return false;
    if (liquidationActive) return false; // NEAR blocked during liquidation
    // Pending request without accepted offer: NEAR allowed
    return true;
  }, [refundsCount, liquidationActive]);
  const canWithdrawUsdc = useMemo(() => {
    if ((refundsCount ?? 0) > 0) return false;
    if (isRequestedTokenWithdrawalBlocked(state, requestToken, usdcId)) return false; // cannot withdraw requested token while pending
    // During liquidation, FT withdrawals are allowed
    return true;
  }, [refundsCount, state, requestToken, usdcId]);

  const disableContinue = useMemo(() => {
    if (!amount) return true;
    if (Number.isNaN(amountNum) || amountNum <= 0) return true;
    if (Number.isNaN(withdrawAvailableNum) || amountNum > withdrawAvailableNum) return true;
    if (kind === "USDC" && ownerRegistered === false) return true;
    if (kind === "NEAR" && !canWithdrawNear) return true;
    if (kind === "USDC" && !canWithdrawUsdc) return true;
    return false;
  }, [amount, amountNum, withdrawAvailableNum, kind, ownerRegistered, canWithdrawNear, canWithdrawUsdc]);

  const resetAndClose = () => {
    setAmount("");
    onClose();
  };

  const confirm = async () => {
    try {
      // Submit human-friendly display amount and let hook parse it
      let txHash = "";
      if (kind === "NEAR") {
        const res = await withdraw({ vault: vaultId, amount });
        txHash = res.txHash;
      } else {
        if (!usdcId) throw new Error(`USDC not configured for network: ${network}`);
        const res = await withdraw({ vault: vaultId, amount, tokenAddress: usdcId, tokenDecimals: usdcDecimals });
        txHash = res.txHash;
      }
      await indexVault({ factoryId, vault: vaultId, txHash });
      if (onSuccess) onSuccess();

    } catch (err) {
      console.warn("Withdraw failed", err);
    } finally {
      resetAndClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Withdraw from vault"
      disableBackdropClose={withdrawing}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={resetAndClose} disabled={withdrawing}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={disableContinue || withdrawing}>
            {withdrawing ? "Withdrawing..." : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="text-sm text-secondary-text">
          Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        <AssetToggle
          value={kind}
          onChange={setKind}
          disabled={withdrawing}
          options={[
            { kind: "NEAR", available: true },
            { kind: "USDC", available: Boolean(usdcId) },
          ]}
        />
        <Input
          label="Amount"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {withdrawError && (
          <div className="text-xs text-red-500">{withdrawError}</div>
        )}
        {kind === "NEAR" ? (
          <MaxAvailable
            loading={availLoading}
            label="Max you can withdraw"
            balance={availBalance}
            buttonAriaLabel="Use maximum available"
            onClick={() => setAmount(availBalance.toDisplay())}
          />
        ) : (
          <MaxAvailable
            loading={usdcLoading}
            label="Max you can withdraw"
            balance={vaultUsdc ?? new Balance("0", usdcDecimals, "USDC")}
            buttonAriaLabel="Use maximum available"
            onClick={() => setAmount(vaultUsdc?.toDisplay() ?? "0")}
          />
        )}
        {kind === "USDC" && usdcId && signedAccountId && ownerRegistered === false && (
          <div className="text-xs text-secondary-text">
            Your wallet is not registered to receive USDC. You must register before withdrawing.
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={storagePending || regLoading || !ownerMinDeposit}
                onClick={async () => {
                  if (!ownerMinDeposit) return;
                  try {
                    await registerStorage(usdcId, signedAccountId, ownerMinDeposit);
                    refreshReg();
                  } catch (e) {
                    console.warn("Storage registration failed", e);
                  }
                }}
              >
                {storagePending ? "Registering..." : `Register USDC storage`}
              </Button>
              {ownerMinDeposit && (
                <span>One-time deposit: {safeFormatYoctoNear(ownerMinDeposit, 5)} NEAR</span>
              )}
            </div>
          </div>
        )}
        {/* Policy notes based on current selection */}
        {kind === "NEAR" && !canWithdrawNear && (
          <div className="text-xs text-secondary-text">NEAR cannot be withdrawn under current conditions (e.g., liquidation in progress).</div>
        )}
        {kind === "USDC" && !canWithdrawUsdc && (
          <div className="text-xs text-secondary-text">Cannot withdraw the requested token while a liquidity request is pending.</div>
        )}
      </div>
    </Modal>
  );
}
