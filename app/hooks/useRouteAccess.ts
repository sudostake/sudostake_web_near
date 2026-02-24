"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { APP_ROUTES } from "@/app/components/navigationRoutes";

export type RouteAccessMode = "public" | "guestOnly" | "authOnly";

export function useRouteAccess(mode: RouteAccessMode) {
  const { signedAccountId } = useWalletSelector();
  const router = useRouter();
  const isSignedIn = Boolean(signedAccountId);

  useEffect(() => {
    if (mode === "guestOnly" && isSignedIn) {
      router.replace(APP_ROUTES.dashboard.href);
      return;
    }

    if (mode === "authOnly" && !isSignedIn) {
      router.replace(APP_ROUTES.login.href);
    }
  }, [isSignedIn, mode, router]);

  const blocked =
    (mode === "guestOnly" && isSignedIn) ||
    (mode === "authOnly" && !isSignedIn);

  return {
    blocked,
    isSignedIn,
    signedAccountId,
  };
}
