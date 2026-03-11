"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/app/components/layout/Container";
import { LogoMark } from "@/app/components/LogoMark";
import { FOOTER_ROUTES, isRouteActive } from "@/app/components/navigationRoutes";

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-panel">
      <Container className="py-5 text-xs text-[color:var(--text-secondary)] sm:py-7 sm:text-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <LogoMark
                  size={28}
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  ariaLabel="SudoStake mark"
                />
                <span className="pixel-heading text-[0.68rem] text-[color:var(--text-primary)] sm:text-xs">
                  SudoStake
                </span>
              </div>
              <p className="max-w-xs text-[0.72rem] leading-5 text-[color:var(--text-secondary)] sm:hidden">
                Stake-backed liquidity with non-custodial vaults on NEAR.
              </p>
            </div>

            <p className="hidden max-w-sm text-[0.72rem] leading-5 text-[color:var(--text-secondary)] sm:block sm:text-right sm:text-sm">
              Stake-backed liquidity with non-custodial vaults on NEAR.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="space-y-1.5">
              <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[color:var(--text-muted)] sm:text-[0.68rem]">
                Explore
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.66rem] uppercase tracking-[0.06em] sm:gap-x-3 sm:text-[0.72rem]">
                {FOOTER_ROUTES.map((route) => {
                  const active = isRouteActive(pathname, route);
                  return (
                    <Link
                      key={route.id}
                      href={route.href}
                      className={[
                        "inline-flex items-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-muted)]",
                        active
                          ? "text-[color:var(--accent-primary)]"
                          : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                      ].join(" ")}
                      aria-current={active ? "page" : undefined}
                    >
                      {route.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <p className="text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--text-muted)] sm:text-[0.72rem]">
              © {currentYear} All rights reserved
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
