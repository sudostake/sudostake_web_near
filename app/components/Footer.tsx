"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/app/components/layout/Container";
import { LogoMark } from "@/app/components/LogoMark";

export function Footer() {
  return (
    <footer className="footer-panel mt-16">
      <Container className="flex flex-col gap-3 py-8 text-sm text-[color:var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark size={28} className="h-7 w-7 rounded-full" ariaLabel="SudoStake mark" />
          <span>© {new Date().getFullYear()} SudoStake - non-custodial vaults</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/discover" className="transition hover:text-[color:var(--accent-primary)]">Discover</Link>
          <Link href="/docs" className="transition hover:text-[color:var(--accent-primary)]">Docs</Link>
        </div>
      </Container>
    </footer>
  );
}
