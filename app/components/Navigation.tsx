"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 0 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z" clipRule="evenodd" />
    </svg>
  );
}
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

/**
 * Navigation bar with Login/Logout button.
 */
export function Navigation() {
  const { signedAccountId, signIn, signOut } = useWalletSelector();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const accountShort = useMemo(() => {
    if (!signedAccountId) return "";
    if (signedAccountId.length <= 20) return signedAccountId;
    const head = signedAccountId.slice(0, 8);
    const tail = signedAccountId.slice(-8);
    return `${head}…${tail}`;
  }, [signedAccountId]);
  const onLogin = () => signIn();
  const onLogout = () => signOut().catch((err) => console.error(err));

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!menuRef.current) return;
      if (target && menuRef.current.contains(target)) return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      {/* z-50 ensures the account dropdown overlays sticky page headers (vault view uses z-30) */}
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 py-3 md:mx-auto md:max-w-2xl">
          <Link href="/" className="text-xl font-bold">
            SudoStake
          </Link>
          {!signedAccountId ? (
            <button
              type="button"
              className="px-3 py-2 rounded bg-primary text-primary-text text-sm"
              onClick={onLogin}
            >
              Login
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded border bg-surface hover:bg-surface/90 py-2 pl-3 pr-2 text-sm"
                aria-haspopup="menu"
                aria-expanded={menuOpen || undefined}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span className="font-mono" title={signedAccountId}>{accountShort}</span>
                <ChevronDownIcon />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 rounded border bg-surface shadow-lg py-1 z-50"
                >
                  <button
                    role="menuitem"
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-background inline-flex items-center gap-2"
                    onClick={onLogout}
                  >
                    <LogoutIcon />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      <div aria-hidden className="h-14" />
    </>
  );
}
