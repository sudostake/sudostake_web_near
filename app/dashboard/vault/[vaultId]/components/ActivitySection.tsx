"use client";

import React from "react";
import type { ViewerRole } from "@/hooks/useViewerRole";
import { Card } from "@/app/components/ui/Card";
import { formatDateTime } from "@/utils/datetime";
import { tsToDate } from "@/utils/firestoreTimestamps";
import type { VaultDocument } from "@/utils/types/vault_document";

type Props = {
  vault: VaultDocument | null;
  role: ViewerRole;
  validatorCount: number;
  refundsCount: number;
};

type ActivityItem = {
  title: string;
  body: string;
  when?: string | null;
  tone?: "neutral" | "info" | "warn";
};

function activityCaption(role: ViewerRole) {
  switch (role) {
    case "owner":
      return "A checkpoint view of the vault lifecycle from the owner side.";
    case "activeLender":
      return "The fastest way to understand where this loan and claim process stand.";
    case "potentialLender":
      return "A concise state history before you decide whether this vault is worth tracking.";
    default:
      return "A concise state view you can read before connecting a wallet.";
  }
}

export function ActivitySection({ vault, role, validatorCount, refundsCount }: Props) {
  const items = React.useMemo<ActivityItem[]>(() => {
    if (!vault) return [];

    const acceptedAt = tsToDate(vault.accepted_offer?.accepted_at);
    const createdAt = tsToDate(vault.created_at);
    const updatedAt = tsToDate(vault.updated_at);
    const expiryDate =
      acceptedAt && vault.liquidity_request?.duration
        ? new Date(acceptedAt.getTime() + vault.liquidity_request.duration * 1000)
        : null;

    const next: ActivityItem[] = [];

    if (createdAt) {
      next.push({
        title: "Vault indexed",
        body: "This vault is available to read from the indexed dataset used by the app.",
        when: formatDateTime(createdAt),
      });
    }

    if (vault.state === "idle") {
      next.push({
        title: "No open request",
        body: "The owner can prepare balances and publish new liquidity terms from the Request section.",
      });
    }

    if (vault.state === "pending" && vault.liquidity_request) {
      next.push({
        title: "Request is waiting for a lender",
        body: "Terms are live, but the loan has not been funded yet.",
        tone: "info",
      });
    }

    if (vault.state === "active" && acceptedAt) {
      next.push({
        title: "Loan funded",
        body: vault.accepted_offer?.lender
          ? `The active lender is ${vault.accepted_offer.lender}.`
          : "The request has been accepted and is now an active loan.",
        when: formatDateTime(acceptedAt),
        tone: "info",
      });
    }

    if (expiryDate) {
      next.push({
        title: vault.liquidation ? "Loan has expired" : "Loan deadline",
        body: vault.liquidation
          ? "Repayment has moved past its deadline and liquidation is now the active path."
          : "Repayment remains available until this deadline is reached.",
        when: formatDateTime(expiryDate),
        tone: vault.liquidation ? "warn" : "neutral",
      });
    }

    if (vault.liquidation) {
      next.push({
        title: "Liquidation is active",
        body: "Claims will settle from vault balances and collateral as funds become available.",
        tone: "warn",
      });
    }

    next.push({
      title: "Delegation footprint",
      body:
        validatorCount > 0
          ? `${validatorCount} validator${validatorCount === 1 ? "" : "s"} currently hold delegated or unstaking positions for this vault.`
          : "There are no validator positions recorded right now.",
    });

    if (refundsCount > 0) {
      next.push({
        title: "Refund queue present",
        body: `${refundsCount} refund entr${refundsCount === 1 ? "y is" : "ies are"} still pending.`,
        tone: "warn",
      });
    }

    if (updatedAt) {
      next.push({
        title: "Last indexed update",
        body: "This is the most recent time the mirrored vault document was refreshed.",
        when: formatDateTime(updatedAt),
      });
    }

    return next;
  }, [vault, validatorCount, refundsCount]);

  return (
    <Card className="space-y-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-5 sm:px-5" role="region" aria-label="Vault activity">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Activity</p>
        <h2 className="text-xl font-semibold text-foreground">Vault checkpoints</h2>
        <p className="text-sm text-secondary-text">{activityCaption(role)}</p>
      </div>

      {items.length > 0 ? (
        <ol className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className={`rounded-2xl border px-4 py-3 ${toneClass(item.tone ?? "neutral")}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <p className="text-sm text-secondary-text">{item.body}</p>
                </div>
                {item.when && (
                  <div className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-secondary-text">
                    {item.when}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-4 text-sm text-secondary-text">
          No checkpoints available yet. Once the vault is indexed with request or loan state, the key milestones will appear here.
        </div>
      )}
    </Card>
  );
}

function toneClass(tone: "neutral" | "info" | "warn") {
  switch (tone) {
    case "info":
      return "border-primary/20 bg-primary/5";
    case "warn":
      return "border-amber-300/60 bg-amber-50/70";
    default:
      return "border-[color:var(--border)] bg-[color:var(--surface-muted)]";
  }
}
