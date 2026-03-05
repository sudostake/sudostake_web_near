"use client";

import React from "react";
import type { ViewerRole } from "@/hooks/useViewerRole";
import { STRINGS, fundedByString } from "@/utils/strings";
import { SpinningTokenPair } from "@/app/components/ui/SpinningTokenPair";
import { Button } from "@/app/components/ui/Button";

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
  if (!hasOpenRequest) return STRINGS.accessUsdcTitle;
  if (isOwner) {
    return state === "active" ? STRINGS.ownerRequestTitleActive : STRINGS.ownerRequestTitlePending;
  }
  return state === "active" && role === "activeLender"
    ? STRINGS.nonOwnerRequestTitleActiveLender
    : STRINGS.nonOwnerRequestTitleGeneric;
}

function headerCaption({ hasOpenRequest, isOwner, state, role, lenderId }: Props): string {
  if (!hasOpenRequest) return STRINGS.accessUsdcCaption;
  if (isOwner) {
    if (state === "pending") return STRINGS.ownerRequestCaptionPending;
    if (lenderId) return fundedByString(String(lenderId));
    return STRINGS.ownerRequestCaptionFunded;
  }
  if (state === "pending") return STRINGS.nonOwnerRequestCaptionPending;
  return role === "activeLender"
    ? STRINGS.nonOwnerRequestCaptionActiveLender
    : STRINGS.nonOwnerRequestCaptionFunded;
}

export function LiquidityRequestHeader(props: Props) {
  const title = headerTitle(props);
  const caption = headerCaption(props);
  return (
    <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <SpinningTokenPair pauseOnHover />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Liquidity request</p>
          <div className="mt-1 text-lg font-semibold leading-tight text-foreground">{title}</div>
          <div className="mt-1 text-sm text-secondary-text">{caption}</div>
        </div>
      </div>
      {!props.hasOpenRequest && props.isOwner && (
        <div className="shrink-0">
          <Button
            type="button"
            onClick={props.onOpenRequest}
            disabled={props.openDisabled}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            {STRINGS.openRequest}
          </Button>
        </div>
      )}
    </div>
  );
}
