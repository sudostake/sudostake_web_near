"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

/**
 * Navigation bar with Login/Logout button.
 */
export function Navigation() {
  const [action, setAction] = useState<() => void>(() => () => {});
  const [label, setLabel] = useState<string>("Loading...");
  const { signedAccountId, signIn, signOut } = useWalletSelector();

  useEffect(() => {
    if (signedAccountId) {
      setAction(() => () => {
        signOut().catch((err) => console.error(err));
      });
      setLabel(`Logout ${signedAccountId}`);
    } else {
      setAction(() => signIn);
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
