"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { Button } from "@/app/components/ui/Button";
import { getActiveNetwork } from "@/utils/networks";
import { getDefaultUsdcTokenId, getTokenDecimals } from "@/utils/tokens";
import { useFtTransfer } from "@/hooks/useFtTransfer";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { utils } from "near-api-js";
import Big from "big.js";
import { showToast } from "@/utils/toast";
import { getFriendlyErrorMessage } from "@/utils/errors";
import { isValidAccountId } from "@/utils/validation/account";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { useFtBalance } from "@/hooks/useFtBalance";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { formatMinimalTokenAmount } from "@/utils/format";
import { useTokenRegistration } from "@/hooks/useTokenRegistration";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // called after a successful send
};

type TokenKind = "NEAR" | "USDC";

const BIG_JS_ROUND_DOWN = 0 as const;

function toMinimal(display: string, decimals: number): string {
  const trimmed = (display ?? "").trim();
  if (!/^\d+(?:\.\d*)?$/.test(trimmed)) {
    throw new Error("Invalid amount format");
  }
  const fraction = trimmed.split(".")[1] ?? "";
  if (fraction.length > decimals) {
    throw new Error(`Amount has more than ${decimals} decimal places`);
  }
  const v = new Big(trimmed);
  return v.times(new Big(10).pow(decimals)).round(0, BIG_JS_ROUND_DOWN).toString();
}

export function SendValueDialog({ open, onClose, onSuccess }: Props) {
  const network = getActiveNetwork();
  const defaultUsdc = getDefaultUsdcTokenId(network);
  const { wallet, signedAccountId } = useWalletSelector();
  const { ftTransfer, pending: ftPending } = useFtTransfer();

  const LS_KEY = "sendValueDialog.lastAssetKind" as const;
  const [kind, setKind] = useState<TokenKind>(defaultUsdc ? "USDC" : "NEAR");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usdcDecimals = useMemo(() => {
    return defaultUsdc ? getTokenDecimals(defaultUsdc, network) : 6;
  }, [defaultUsdc, network]);

  // Balances for helper UI
  const { balance: ownerUsdcMinimal } = useFtBalance(defaultUsdc ?? undefined);
  const { balance: ownerNearDisplay } = useAccountBalance(signedAccountId);
  const { registered: ownerRegistered, minDeposit: ownerMinDeposit, loading: regLoading } =
    useTokenRegistration(defaultUsdc ?? null, signedAccountId ?? null);
  const receiverValid = receiver ? isValidAccountId(receiver) : false;
  const { registered: recipientRegistered, loading: recipRegLoading, minDeposit: recipMinDeposit } =
    useTokenRegistration(defaultUsdc ?? null, kind === "USDC" && receiverValid ? receiver : null);

  // Load last used kind on open
  useEffect(() => {
    if (!open) return;
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
      if (saved === "USDC" && defaultUsdc) setKind("USDC");
      else if (saved === "NEAR") setKind("NEAR");
    } catch {}
  }, [open, defaultUsdc]);

  // Persist selection
  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, kind);
    } catch {}
  }, [kind]);

  const amountMinimalPreview = useMemo(() => {
    try {
      if (!amount) return null;
      if (kind === "NEAR") {
        const y = utils.format.parseNearAmount(amount);
        if (!y) return "0";
        return y;
      } else {
        return toMinimal(amount, usdcDecimals);
      }
    } catch (e) { return null; }
  }, [amount, kind, usdcDecimals]);

  const amountValid = Boolean(amountMinimalPreview && amountMinimalPreview !== "0");
  const canSubmit = Boolean(
    receiverValid &&
    amountValid &&
    !submitting &&
    !ftPending &&
    // For USDC, require an explicit registered === true
    (kind !== "USDC" || (ownerRegistered === true && recipientRegistered === true))
  );

  const validationMessage = (() => {
    if (!receiver) return "Enter a recipient account";
    if (!receiverValid) return "Recipient account ID is invalid";
    if (!amount) return "Enter an amount";
    if (!amountValid) return `Amount must be greater than 0 ${kind}`;
    if (kind === "USDC") {
      if (regLoading) return "Checking your token registration…";
      if (ownerRegistered === false) return "You must register with the USDC token before sending";
      if (recipRegLoading) return "Checking recipient registration…";
      if (recipientRegistered === false) return "Recipient must be registered with USDC before they can receive";
    }
    return null;
  })();

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setReceiver(text.trim());
    } catch {
      showToast("Clipboard read failed", { variant: "error" });
    }
  };

  const onSubmit = async () => {
    if (!signedAccountId) {
      showToast("Connect your wallet first", { variant: "error" });
      return;
    }
    if (!receiver) return;
    if (!amount) return;
    setSubmitting(true);
    setError(null);
    try {
      if (kind === "NEAR") {
        if (!wallet) throw new Error("No wallet connected");
        const yocto = utils.format.parseNearAmount(amount);
        if (!yocto) throw new Error("Invalid NEAR amount");
        await wallet.signAndSendTransaction({
          receiverId: receiver,
          actions: [{ type: "Transfer", params: { deposit: yocto } }],
        });
        showToast(`Sent ${amount} NEAR to ${receiver}`, { variant: "success" });
        onSuccess?.();
        onClose();
      } else if (kind === "USDC") {
        if (ownerRegistered !== true) {
          showToast("You must register with the USDC token before sending", { variant: "error" });
          return;
        }
        if (recipientRegistered !== true) {
          showToast("Recipient must be registered with the USDC token before they can receive", { variant: "error" });
          return;
        }
        if (!defaultUsdc) throw new Error("USDC not configured on this network");
        const minimal = toMinimal(amount, usdcDecimals);
        if (minimal === "0") throw new Error("Amount must be greater than zero");
        await ftTransfer({ token: defaultUsdc, receiverId: receiver, amount: minimal, memo: memo || undefined });
        showToast(`Sent ${amount} USDC to ${receiver}`, { variant: "success" });
        onSuccess?.();
        onClose();
      }
    } catch (e) {
      setError(getFriendlyErrorMessage(e));
      showToast(getFriendlyErrorMessage(e), { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting || ftPending ? () => {} : onClose}
      disableBackdropClose={submitting || ftPending}
      title={`Send ${kind}`}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting || ftPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit}>
            {submitting || ftPending ? "Sending…" : `Send ${kind}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-xs text-secondary-text">Network: <span className="uppercase font-medium">{network}</span></div>
        <div>
          <div className="text-sm text-secondary-text mb-1">Asset</div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="asset"
                value="NEAR"
                checked={kind === "NEAR"}
                onChange={() => setKind("NEAR")}
              />
              <span>NEAR</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer opacity-100">
              <input
                type="radio"
                name="asset"
                value="USDC"
                checked={kind === "USDC"}
                onChange={() => setKind("USDC")}
                disabled={!defaultUsdc}
              />
              <span>USDC{!defaultUsdc ? " (unavailable)" : ""}</span>
            </label>
          </div>
          {/* Keep UI minimal; hide mechanics */}
        </div>
        <div>
          <label className="block text-sm text-secondary-text mb-1">Recipient account</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value.trim())}
              placeholder="alice.near"
              className="flex-1 rounded border bg-background px-3 h-10 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <Button
              variant="ghost"
              size="sm"
              type="button"
              title="Paste from clipboard"
              onClick={pasteFromClipboard}
            >
              Paste
            </Button>
          </div>
          {!receiverValid && receiver && (
            <div className="mt-1 text-xs text-red-500">Recipient account ID is invalid</div>
          )}
          {kind === "USDC" && defaultUsdc && receiverValid && (
            <div className="mt-1 text-xs">
              {recipRegLoading ? (
                <span className="text-secondary-text">Checking recipient registration…</span>
              ) : recipientRegistered === false ? (
                <span className="text-amber-600 dark:text-amber-400">
                  Recipient is not registered with USDC. They must register first
                  {recipMinDeposit ? ` (~${utils.format.formatNearAmount(recipMinDeposit)} NEAR one-time).` : "."}
                </span>
              ) : recipientRegistered === true ? (
                <span className="text-green-600 dark:text-green-400">Recipient is registered</span>
              ) : null}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-secondary-text mb-1">Amount ({kind})</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={kind === "NEAR" ? "0.0" : "0"}
            inputMode="decimal"
            className="w-full rounded border bg-background px-3 h-10 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          {kind === "USDC" && (
            <div className="mt-1 flex items-center justify-between text-xs text-secondary-text">
              <div>Up to {usdcDecimals} decimals</div>
              <div className="flex items-center gap-2">
                <div>
                  Your balance: {ownerUsdcMinimal ? `${formatMinimalTokenAmount(ownerUsdcMinimal, usdcDecimals)} USDC` : "—"}
                </div>
                {ownerUsdcMinimal && ownerUsdcMinimal !== "0" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setAmount(formatMinimalTokenAmount(ownerUsdcMinimal, usdcDecimals))}
                    title="Use entire balance"
                  >
                    Max
                  </Button>
                )}
              </div>
            </div>
          )}
          {kind === "NEAR" && (
            <div className="mt-1 text-xs text-secondary-text">Your balance: {ownerNearDisplay} NEAR</div>
          )}
        </div>
        {kind === "USDC" && (
          <div>
            <label className="block text-sm text-secondary-text mb-1">Memo (optional)</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Payment reference"
              className="w-full rounded border bg-background px-3 h-10 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        )}
        {kind === "USDC" && defaultUsdc && (
          <div>
            <div className="text-sm text-secondary-text mb-1">Token contract</div>
            <div className="flex items-center justify-between gap-2 rounded border bg-background px-3 h-10">
              <div className="truncate" title={defaultUsdc}>{defaultUsdc}</div>
              <CopyButton value={defaultUsdc} title="Copy token id" />
            </div>
          </div>
        )}

        {kind === "USDC" && (
          <div className="mt-2 text-xs">
            {regLoading ? (
              <span className="text-secondary-text">Checking token registration…</span>
            ) : ownerRegistered === false ? (
              <span className="text-amber-600 dark:text-amber-400">
                Your account is not registered with this token. Registration is required to send USDC
                {ownerMinDeposit ? ` (~${utils.format.formatNearAmount(ownerMinDeposit)} NEAR one-time).` : "."}
              </span>
            ) : null}
          </div>
        )}

        {/* Clear summary of action */}
        <div className="rounded border bg-background p-3 text-sm">
          <div className="font-medium">You are sending</div>
          <div className="mt-1 text-base">
            <span className="font-semibold">{amount || "—"} {kind}</span>
            <span className="mx-1">to</span>
            <span className="font-mono">{receiver || "—"}</span>
            <span className="mx-1">on</span>
            <span className="uppercase">{network}</span>
          </div>
          {/* Omit mechanism details for simplicity */}
          {validationMessage && (
            <div className="mt-1 text-xs text-secondary-text">{validationMessage}</div>
          )}
          <div className="mt-2 text-xs text-secondary-text">
            You’ll review and approve this in your wallet before it’s sent.
          </div>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>
    </Modal>
  );
}
