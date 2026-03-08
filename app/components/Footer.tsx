"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/app/components/layout/Container";
import { LogoMark } from "@/app/components/LogoMark";
import { FOOTER_ROUTES, isRouteActive } from "@/app/components/navigationRoutes";

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="footer-panel">
      <Container className="flex flex-col gap-3 py-7 text-xs text-[color:var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:py-8 sm:text-sm">
        <div className="flex items-center gap-2.5">
          <LogoMark
            size={28}
            className="h-6 w-6 sm:h-7 sm:w-7"
            ariaLabel="SudoStake mark"
          />
          <span className="pixel-heading text-[0.68rem] sm:text-xs">© {new Date().getFullYear()} SudoStake - non-custodial vaults</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {FOOTER_ROUTES.map((route) => {
            const active = isRouteActive(pathname, route);
            return (
              <Link
                key={route.id}
                href={route.href}
                className={[
                  "inline-flex items-center px-1.5 py-0.5 text-xs font-semibold uppercase tracking-[0.06em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:px-2 sm:py-1 sm:text-sm",
                  active
                    ? "text-[color:var(--accent-primary)] underline decoration-2 underline-offset-4 decoration-[color:var(--accent-primary)]"
                    : "text-[color:var(--text-primary)] hover:text-[color:var(--accent-primary)] hover:underline hover:decoration-2 hover:underline-offset-4 hover:decoration-[color:var(--accent-primary)]",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {route.label}
              </Link>
            );
          })}
        </div>
      </Container>
    </footer>
  );
}
