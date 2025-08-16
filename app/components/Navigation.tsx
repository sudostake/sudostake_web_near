"use client";

import React, { useEffect, useState } from "react";
// Logout icon (Arrow pointing out of a rectangle)
function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}
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

  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const ENTER_THRESHOLD = 72;
    const EXIT_THRESHOLD = 24;
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const y = window.scrollY;
        setCompact((prev) => {
          if (!prev && y > ENTER_THRESHOLD) return true;
          if (prev && y < EXIT_THRESHOLD) return false;
          return prev;
        });
      });
    };
    setCompact(window.scrollY > ENTER_THRESHOLD);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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
    <nav
      className={[
        "sticky top-0 z-20 border-b border-white/10 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50",
      ].join(" ")}
      style={{ willChange: "padding, background-color, backdrop-filter, box-shadow" }}
    >
      <div
        className={[
          "flex items-center justify-between px-4 md:mx-auto md:max-w-2xl transition-all duration-300",
          compact ? "py-2 shadow-sm" : "py-3 shadow-none",
        ].join(" ")}
      >
        <Link href="/" className="text-xl font-bold">
          SudoStake
        </Link>
        <button
          className="px-4 py-2 bg-primary text-primary-text rounded disabled:opacity-50"
          onClick={action}
          disabled={label === "Loading..."}
        >
          {signedAccountId ? <LogoutIcon /> : label}
        </button>
      </div>
    </nav>
  );
}
