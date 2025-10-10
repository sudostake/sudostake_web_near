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
function DiscoverIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-5 h-5"
    >
      {/* Compass icon */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v0m0 0a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 9.879l-1.06 3.182a1 1 0 0 1-.66.66l-3.182 1.06a.25.25 0 0 1-.316-.316l1.06-3.182a1 1 0 0 1 .66-.66l3.182-1.06a.25.25 0 0 1 .316.316Z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a8.25 8.25 0 1 1 15 0" />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5A2.25 2.25 0 0 1 6 5.25h12A2.25 2.25 0 0 1 20.25 7.5v9a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 16.5v-9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12h.008v.008H16.5V12Z" />
    </svg>
  );
}
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Button } from "@/app/components/ui/Button";
import { getActiveNetwork } from "@/utils/networks";
import { showToast } from "@/utils/toast";

/**
 * Navigation bar with Login/Logout button.
 */
export function Navigation() {
  const { signedAccountId, signOut, signIn } = useWalletSelector();
  // const router = useRouter();
  const [network, setNetwork] = useState<string>("");
  useEffect(() => {
    // Reflect current network for clarity; safe on client
    setNetwork(getActiveNetwork());
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const accountShort = useMemo(() => {
    if (!signedAccountId) return "";
    if (signedAccountId.length <= 20) return signedAccountId;
    const head = signedAccountId.slice(0, 8);
    const tail = signedAccountId.slice(-8);
    return `${head}…${tail}`;
  }, [signedAccountId]);
  const onLogout = () => signOut().catch((err) => console.error(err));
  const onConnect = React.useCallback(() => {
    Promise.resolve(signIn())
      .catch((err) => {
        console.error("Wallet sign-in failed", err);
        showToast("Wallet connection failed. Please try again.", { variant: "error" });
      });
  }, [signIn]);

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
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const setVar = () => {
      const h = el.offsetHeight || 56;
      document.documentElement.style.setProperty('--nav-height', h + 'px');
    };
    setVar();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(setVar) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', setVar);
    return () => {
      window.removeEventListener('resize', setVar);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <>
      {/* Ensure the account dropdown overlays sticky page headers (vault view uses z-30). */}
      <nav
        ref={navRef}
        className={[
          "fixed left-0 right-0 top-0 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50",
        ].join(" ")}
        style={{ zIndex: "var(--z-nav, 50)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1.5 px-4 sm:px-6 lg:px-8 py-1.5 sm:flex-nowrap sm:justify-between sm:py-2.5">
          <div className="flex flex-1 items-center gap-2 sm:gap-4">
            <Link href="/" className="text-xl font-bold whitespace-nowrap">
              SudoStake
            </Link>
            {network && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-background/70 px-2 py-1 text-[11px] uppercase tracking-wide text-secondary-text md:hidden">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden="true" />
                {network}
              </span>
            )}
            {network && (
              <span className="hidden md:inline text-xs rounded border bg-surface px-2 py-0.5 text-secondary-text" title="Active network">
                {network}
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 sm:justify-end">
            {/* Mobile shortcuts */}
            <Link
              href="/discover"
              aria-label="Discover"
              className="inline-flex h-9 w-9 items-center justify-center rounded-app border bg-surface hover:bg-surface/90 focus:outline-none focus:ring-1 focus:ring-primary/40 md:hidden"
            >
              <DiscoverIcon />
              <span className="sr-only">Discover</span>
            </Link>
            <Link
              href="/docs"
              aria-label="Docs"
              className="inline-flex h-9 w-9 items-center justify-center rounded-app border bg-surface hover:bg-surface/90 focus:outline-none focus:ring-1 focus:ring-primary/40 md:hidden"
            >
              <span className="sr-only">Docs</span>
              {/* Simple book icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v12a2 2 0 0 0-2 2H5a2 2 0 0 1-2-2V5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 0 1 2-2h12" />
              </svg>
            </Link>

            {/* Desktop links on the right */}
            <Link href="/discover" className="hidden md:inline text-sm text-secondary-text hover:underline">
              Discover
            </Link>
            <Link href="/docs" className="hidden md:inline text-sm text-secondary-text hover:underline">
              Docs
            </Link>

            {/* Desktop nav items are on the left next to brand */}

            {!signedAccountId && (
              <>
                <button
                  type="button"
                  aria-label="Connect wallet"
                  onClick={onConnect}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-app border bg-surface hover:bg-surface/90 focus:outline-none focus:ring-1 focus:ring-primary/40 md:hidden"
                >
                  <WalletIcon />
                  <span className="sr-only">Connect wallet</span>
                </button>
                <div className="hidden md:block">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onConnect}
                    className="items-center justify-center whitespace-nowrap"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </>
            )}

            {signedAccountId && (
              <div className="relative" ref={menuRef}>
                {/* Mobile account icon trigger */}
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen || undefined}
                  onClick={() => setMenuOpen((o) => !o)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-app border bg-surface hover:bg-surface/90 focus:outline-none focus:ring-1 focus:ring-primary/40 md:hidden"
                >
                  <UserIcon />
                  <span className="sr-only">Account</span>
                </button>

                {/* Desktop account button trigger (wrapped to ensure it's hidden on mobile) */}
                <div className="hidden md:block">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="inline-flex items-center justify-between gap-2 pl-3 pr-2"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen || undefined}
                    onClick={() => setMenuOpen((o) => !o)}
                  >
                    <span className="font-mono" title={signedAccountId}>{accountShort}</span>
                    <ChevronDownIcon />
                  </Button>
                </div>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 rounded-app border bg-surface shadow-lg py-1 z-50"
                  >
                    {signedAccountId && (
                      <div className="px-3 py-2 text-xs text-secondary-text/90 border-b border-white/12" role="none">
                        <span className="font-mono block truncate" title={signedAccountId}>{signedAccountId}</span>
                      </div>
                    )}
                    <Button
                      role="menuitem"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-3 py-2 text-sm"
                      onClick={onLogout}
                    >
                      <LogoutIcon />
                      <span>Logout</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      <div aria-hidden="true" style={{ height: "var(--nav-height, 56px)" }} />
    </>
  );
}
