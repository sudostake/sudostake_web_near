"use client";

import React from "react";
import type { ViewerRole } from "@/hooks/useViewerRole";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";

type Props = {
  role: ViewerRole;
  state?: "idle" | "pending" | "active" | null;
  liquidationActive: boolean;
  signedAccountId?: string | null;
  refundsCount?: number;
  refundsLoading?: boolean;
  validatorCount?: number;
  withdrawableCount?: number;
  delegationsLoading?: boolean;
  delegationsError?: string | null;
  hasOpenRequest?: boolean;
};

const ROLE_META: Record<ViewerRole, { short: string }> = {
  guest: {
    short: "Guest",
  },
  owner: {
    short: "Owner",
  },
  activeLender: {
    short: "Lender",
  },
  potentialLender: {
    short: "Viewer",
  },
};

function shortAccount(accountId?: string | null) {
  if (!accountId) return "Not connected";
  if (accountId.length <= 24) return accountId;
  return `${accountId.slice(0, 10)}…${accountId.slice(-8)}`;
}

function stateMeta(state?: "idle" | "pending" | "active" | null, liquidationActive?: boolean) {
  if (liquidationActive) {
    return {
      badge: <Badge variant="danger">Liquidation active</Badge>,
      label: "Liquidation",
    };
  }

  switch (state) {
    case "active":
      return {
        badge: <Badge variant="success">Active loan</Badge>,
        label: "Active",
      };
    case "pending":
      return {
        badge: <Badge variant="warn">Awaiting lender</Badge>,
        label: "Pending",
      };
    default:
      return {
        badge: <Badge variant="neutral">Idle vault</Badge>,
        label: "Idle",
      };
  }
}

export function VaultInsightsStrip({
  role,
  state,
  liquidationActive,
  signedAccountId,
  refundsCount,
  refundsLoading,
  validatorCount = 0,
  withdrawableCount = 0,
  delegationsLoading = false,
  delegationsError = null,
  hasOpenRequest = false,
}: Props) {
  const roleMeta = ROLE_META[role];
  const lifecycle = stateMeta(state, liquidationActive);
  const operations = (() => {
    if (role === "guest") {
      return {
        title: "Connect",
        badge: <Badge variant="neutral">Connect to act</Badge>,
      };
    }
    if (refundsLoading) {
      return {
        title: "Syncing",
        badge: <Badge variant="neutral">Refreshing</Badge>,
      };
    }
    if (typeof refundsCount === "number" && refundsCount > 0) {
      return {
        title: `${refundsCount} refund${refundsCount === 1 ? "" : "s"}`,
        badge: <Badge variant="warn">Attention needed</Badge>,
      };
    }
    if (liquidationActive) {
      return {
        title: "Restricted",
        badge: <Badge variant="danger">Restricted</Badge>,
      };
    }
    if (role === "owner") {
      if (state === "active") {
        return {
          title: "Repay",
          badge: <Badge variant="info">Loan live</Badge>,
        };
      }
      if (state === "pending") {
        return {
          title: "Publish",
          badge: <Badge variant="success">Owner controls live</Badge>,
        };
      }
      return {
        title: "Operate",
        badge: <Badge variant="success">Ready to operate</Badge>,
      };
    }
    if (role === "activeLender") {
      return {
        title: "Monitor",
        badge: <Badge variant="info">Monitor settlement</Badge>,
      };
    }
    if (hasOpenRequest) {
      return {
        title: "Review",
        badge: <Badge variant="info">Potential lender</Badge>,
      };
    }
    return {
      title: "No live action",
      badge: <Badge variant="neutral">Nothing to fund</Badge>,
    };
  })();
  const validatorMeta = (() => {
    if (delegationsLoading) {
      return {
        title: "Syncing",
        badge: <Badge variant="neutral">Refreshing</Badge>,
      };
    }
    if (delegationsError) {
      return {
        title: "Unavailable",
        badge: <Badge variant="warn">Data unavailable</Badge>,
      };
    }
    if (validatorCount > 0 && withdrawableCount > 0) {
      return {
        title: `${validatorCount} live / ${withdrawableCount} ready`,
        badge: <Badge variant="success">Claimable funds ready</Badge>,
      };
    }
    if (validatorCount > 0) {
      return {
        title: `${validatorCount} tracked`,
        badge: <Badge variant="info">Monitoring positions</Badge>,
      };
    }
    return {
      title: "None",
      badge: <Badge variant="neutral">No positions</Badge>,
    };
  })();

  return (
    <Card
      aria-label="Vault context"
      className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-3 sm:px-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StatusItem label="Viewer" value={roleMeta.short} meta={signedAccountId ? shortAccount(signedAccountId) : undefined} />
          <StatusItem label="State" value={lifecycle.label} />
          <StatusItem label="Delegations" value={validatorMeta.title} />
          <StatusItem label="Access" value={operations.title} />
        </div>
        <div className="flex flex-wrap gap-2">
          {lifecycle.badge}
          {validatorMeta.badge}
          {operations.badge}
        </div>
      </div>
    </Card>
  );
}

function StatusItem({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</p>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
      {meta ? <p className="mt-0.5 truncate text-xs text-secondary-text">{meta}</p> : null}
    </div>
  );
}
