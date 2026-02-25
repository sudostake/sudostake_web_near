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
    <footer className="footer-panel mt-16">
      <Container className="flex flex-col gap-3 py-8 text-sm text-[color:var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark
            size={28}
            className="h-7 w-7 border-2 border-[color:var(--panel-border)] bg-[color:var(--surface)] p-1"
            ariaLabel="SudoStake mark"
          />
          <span className="pixel-heading text-[0.58rem]">© {new Date().getFullYear()} SudoStake - non-custodial vaults</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FOOTER_ROUTES.map((route) => {
            const active = isRouteActive(pathname, route);
            return (
              <Link
                key={route.id}
                href={route.href}
                className={[
                  "pixel-link rounded-app px-2.5 py-1 text-[0.58rem] transition",
                  active
                    ? "border-[color:var(--accent-primary)] bg-[color:var(--surface-muted)] text-primary"
                    : "text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)]",
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
