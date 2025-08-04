"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

/**
 * Navigation bar with Login/Logout button.
 */
export function Navigation() {
  /**
   * Auth button state:
   * - action: click handler (no-op until auth state resolved)
   * - label: button text reflecting current auth state
   *
   * When signedAccountId, signIn, or signOut change, update both action and label:
   *  • signedAccountId present → action calls signOut, label shows "Logout <accountId>"
   *  • otherwise → action calls signIn, label shows "Login"
   */
  const [action, setAction] = useState<() => void>(() => () => {});
  const [label, setLabel] = useState<string>("Loading...");
  const { signedAccountId, signIn, signOut } = useWalletSelector();

  useEffect(() => {
    if (signedAccountId) {
      // user is signed in: clicking will sign out
      setAction(() => () => {
        signOut().catch((err) => console.error(err));
      });
      setLabel(`Logout ${signedAccountId}`);
    } else {
      // user is not signed in: clicking will initiate sign-in flow
      setAction(() => () => {
        signIn();
      });
      setLabel("Login");
    }
  }, [signedAccountId, signIn, signOut]);

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-50">
      <Link href="/" className="text-xl font-bold">
        SudoStake
      </Link>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        onClick={action}
        disabled={label === "Loading..."}
      >
        {label}
      </button>
    </nav>
  );
}
