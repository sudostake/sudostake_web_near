"use client";

import React from "react";
import type { ViewerRole } from "@/hooks/useViewerRole";
import { STRINGS } from "@/utils/strings";
import { SpinningTokenPair } from "@/app/components/ui/SpinningTokenPair";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";

type Props = {
  hasOpenRequest: boolean;
  isOwner: boolean;
  state?: "idle" | "pending" | "active";
  role: ViewerRole;
  lenderId?: string | null;
  openDisabled: boolean;
  onOpenRequest: () => void;
};

function headerTitle({ hasOpenRequest, isOwner, state, role }: Props): string {
  if (!hasOpenRequest) {
    if (isOwner) return STRINGS.accessUsdcTitle;
    return "No live liquidity request";
  }
  if (isOwner) {
    return state === "active" ? STRINGS.ownerRequestTitleActive : STRINGS.ownerRequestTitlePending;
  }
  return state === "active" && role === "activeLender"
    ? STRINGS.nonOwnerRequestTitleActiveLender
    : STRINGS.nonOwnerRequestTitleGeneric;
}

export function LiquidityRequestHeader(props: Props) {
  const title = headerTitle(props);
  const requestBadge = (() => {
    if (!props.hasOpenRequest) return props.isOwner ? <Badge variant="info">Ready to publish</Badge> : null;
    if (props.state === "pending") return <Badge variant="warn">Awaiting lender</Badge>;
    if (props.state === "active" && props.role === "activeLender") return null;
    if (props.state === "active") return <Badge variant="info">Loan active</Badge>;
    return <Badge variant="neutral">Vault request</Badge>;
  })();
  return (
    <Card
      className="surface-card rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-5 sm:px-5"
      role="region"
      aria-label="Liquidity request"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/8 p-2.5">
            <SpinningTokenPair pauseOnHover />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Liquidity request</p>
              {requestBadge ?? null}
            </div>
            <div className="mt-1 text-lg font-semibold leading-tight text-foreground">{title}</div>
          </div>
        </div>
        {!props.hasOpenRequest && props.isOwner && (
          <div className="w-full shrink-0 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-2 lg:w-auto">
            <Button
              type="button"
              onClick={props.onOpenRequest}
              disabled={props.openDisabled}
              variant="primary"
              size="sm"
              className="w-full gap-2 sm:min-w-[11rem] lg:w-auto"
            >
              {STRINGS.openRequest}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
