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
          <LogoMark size={28} className="h-7 w-7 rounded-full" ariaLabel="SudoStake mark" />
          <span>© {new Date().getFullYear()} SudoStake - non-custodial vaults</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FOOTER_ROUTES.map((route) => {
            const active = isRouteActive(pathname, route);
            return (
              <Link
                key={route.id}
                href={route.href}
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-medium transition",
                  active
                    ? "bg-primary/10 text-primary"
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
