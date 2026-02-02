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
    <div className="flex items-center gap-4">
      <SpinningTokenPair pauseOnHover />
      <div className="flex-1 min-w-0">
        <div className="text-base font-medium">{title}</div>
        <div className="mt-1 text-sm text-secondary-text">{caption}</div>
      </div>
      {!props.hasOpenRequest && props.isOwner && (
        <div className="shrink-0">
          <Button
            type="button"
            onClick={props.onOpenRequest}
            disabled={props.openDisabled}
            variant="secondary"
            size="md"
            className="gap-2"
          >
            {STRINGS.openRequest}
          </Button>
        </div>
      )}
    </div>
  );
}
