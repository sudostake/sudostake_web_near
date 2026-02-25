"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Button } from "@/app/components/ui/Button";
import { LogoMark } from "@/app/components/LogoMark";
import { AUTH_NAV_ROUTES, PUBLIC_NAV_ROUTES, getBrandRoute, isRouteActive, type NavRoute } from "@/app/components/navigationRoutes";
import { getActiveNetwork } from "@/utils/networks";
import { showToast } from "@/utils/toast";

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 0 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z" clipRule="evenodd" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a8.25 8.25 0 1 1 15 0" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5A2.25 2.25 0 0 1 6 5.25h12A2.25 2.25 0 0 1 20.25 7.5v9a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 16.5v-9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12h.008v.008H16.5V12Z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 11.25 9-8.25 9 8.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 10.5v8.25A2.25 2.25 0 0 0 7.5 21h9a2.25 2.25 0 0 0 2.25-2.25V10.5" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h7.5v7.5h-7.5v-7.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.75h7.5v4.5h-7.5v-4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 11.25h7.5v9h-7.5v-9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 14.25h7.5v6h-7.5v-6Z" />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 9.879l-1.06 3.182a1 1 0 0 1-.66.66l-3.182 1.06a.25.25 0 0 1-.316-.316l1.06-3.182a1 1 0 0 1 .66-.66l3.182-1.06a.25.25 0 0 1 .316.316Z" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v12a2 2 0 0 0-2 2H5a2 2 0 0 1-2-2V5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 0 1 2-2h12" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}

function routeIcon(routeId: NavRoute["id"]) {
  if (routeId === "dashboard") return <DashboardIcon />;
  if (routeId === "discover") return <DiscoverIcon />;
  if (routeId === "docs") return <DocsIcon />;
  if (routeId === "login") return <LoginIcon />;
  return <HomeIcon />;
}

function desktopLinkClass(active: boolean) {
  return [
    "pixel-link inline-flex items-center rounded-app px-3 py-1.5 text-[0.62rem] transition",
    active
      ? "border-[color:var(--accent-primary)] bg-[color:var(--surface-muted)] text-[color:var(--accent-primary)]"
      : "text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)]",
  ].join(" ");
}

function mobileLinkClass(active: boolean) {
  return [
    "inline-flex h-9 w-9 items-center justify-center rounded-app border-2 border-[color:var(--panel-border)] bg-[color:var(--surface)] transition focus-soft",
    active
      ? "border-[color:var(--accent-primary)] text-primary"
      : "text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)]",
  ].join(" ");
}

export function Navigation() {
  const { signedAccountId, signOut, signIn } = useWalletSelector();
  const pathname = usePathname();
  const routes = signedAccountId ? AUTH_NAV_ROUTES : PUBLIC_NAV_ROUTES;
  const mobileRoutes = useMemo(
    () => routes.filter((route) => route.id !== "login").slice(0, 3),
    [routes]
  );
  const brandHref = getBrandRoute(Boolean(signedAccountId)).href;

  const [network, setNetwork] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setNetwork(getActiveNetwork());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const accountShort = useMemo(() => {
    if (!signedAccountId) return "";
    if (signedAccountId.length <= 20) return signedAccountId;
    return `${signedAccountId.slice(0, 8)}…${signedAccountId.slice(-8)}`;
  }, [signedAccountId]);

  const onLogout = () => signOut().catch((err) => console.error(err));

  const onConnect = React.useCallback(() => {
    if (connecting) return;
    setConnecting(true);
    Promise.resolve(signIn())
      .catch((err) => {
        console.error("Wallet sign-in failed", err);
        showToast("Wallet connection failed. Please try again.", { variant: "error" });
      })
      .finally(() => setConnecting(false));
  }, [connecting, signIn]);

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
      document.documentElement.style.setProperty("--nav-height", `${h}px`);
    };
    setVar();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(setVar) : null;
    if (ro) ro.observe(el);
    window.addEventListener("resize", setVar);
    return () => {
      window.removeEventListener("resize", setVar);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className="nav-panel fixed left-0 right-0 top-0"
        style={{ zIndex: "var(--z-nav, 50)" }}
      >
        <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-1.5 px-5 py-2 sm:flex-nowrap sm:justify-between sm:px-6 sm:py-2.5 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <Link
              href={brandHref}
              className="pixel-heading inline-flex items-center gap-2.5 whitespace-nowrap text-[0.72rem] text-[color:var(--text-primary)] transition hover:text-[color:var(--accent-primary)] sm:text-[0.78rem]"
            >
              <LogoMark
                size={34}
                className="h-8 w-8 sm:h-9 sm:w-9"
                ariaLabel="SudoStake home"
              />
              <span>SudoStake</span>
            </Link>
            {network && (
              <span
                className="pixel-chip hidden px-2.5 py-0.5 text-[0.58rem] text-[color:var(--text-secondary)] md:inline"
                title="Active network"
              >
                {network}
              </span>
            )}
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {routes.map((route) => {
              const active = isRouteActive(pathname, route);
              if (!signedAccountId && route.id === "login") {
                return (
                  <button
                    key={route.id}
                    type="button"
                    className={desktopLinkClass(active)}
                    onClick={onConnect}
                    disabled={connecting}
                    aria-busy={connecting || undefined}
                  >
                    {connecting ? "Opening wallet..." : route.label}
                  </button>
                );
              }
              return (
                <Link
                  key={route.id}
                  href={route.href}
                  className={desktopLinkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {route.label}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2 sm:justify-end">
            <div className="flex items-center gap-1 md:hidden">
              {mobileRoutes.map((route) => {
                const active = isRouteActive(pathname, route);
                return (
                  <Link
                    key={route.id}
                    href={route.href}
                    aria-label={route.label}
                    aria-current={active ? "page" : undefined}
                    className={mobileLinkClass(active)}
                  >
                    {routeIcon(route.id)}
                    <span className="sr-only">{route.label}</span>
                  </Link>
                );
              })}
            </div>

            {!signedAccountId && (
              <>
                <button
                  type="button"
                  aria-label="Connect wallet"
                  onClick={onConnect}
                  disabled={connecting}
                  aria-busy={connecting || undefined}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-app border-2 border-[color:var(--panel-border)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] focus-soft md:hidden"
                >
                  <WalletIcon />
                  <span className="sr-only">Connect wallet</span>
                </button>
                <div className="hidden md:block">
                  <Button variant="primary" size="sm" onClick={onConnect} className="items-center justify-center whitespace-nowrap">
                    {connecting ? "Opening wallet..." : "Connect wallet"}
                  </Button>
                </div>
              </>
            )}

            {signedAccountId && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen || undefined}
                  onClick={() => setMenuOpen((open) => !open)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-app border-2 border-[color:var(--panel-border)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] focus-soft md:hidden"
                >
                  <UserIcon />
                  <span className="sr-only">Account menu</span>
                </button>

                <div className="hidden md:block">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="inline-flex items-center justify-between gap-2 pl-3 pr-2"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen || undefined}
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    <span className="font-mono" title={signedAccountId}>{accountShort}</span>
                    <ChevronDownIcon />
                  </Button>
                </div>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-48 rounded-app border-2 border-[color:var(--panel-border)] bg-[color:var(--surface)] py-1 shadow-[var(--pixel-shadow)]"
                  >
                    <div
                      className="border-b-2 border-[color:var(--panel-border)] px-3 py-2 text-xs text-[color:var(--text-secondary)]/90"
                      role="none"
                    >
                      <span className="block truncate font-mono" title={signedAccountId}>{signedAccountId}</span>
                    </div>
                    {AUTH_NAV_ROUTES.map((route) => {
                      const active = isRouteActive(pathname, route);
                      return (
                        <Link
                          key={route.id}
                          href={route.href}
                          role="menuitem"
                          className={[
                            "block px-3 py-2 text-sm transition",
                            active
                              ? "bg-[color:var(--surface-muted)] text-primary"
                              : "text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] hover:text-foreground",
                          ].join(" ")}
                        >
                          {route.label}
                        </Link>
                      );
                    })}
                    <div className="my-1 border-t-2 border-[color:var(--panel-border)]" />
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
