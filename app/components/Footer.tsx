"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/app/components/layout/Container";

export function Footer() {
  return (
    <footer className="mt-16 border-t">
      <Container className="py-8 text-sm text-secondary-text flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>© {new Date().getFullYear()} SudoStake — non‑custodial vaults</div>
        <div className="flex items-center gap-4">
          <Link href="/discover" className="hover:underline">Discover</Link>
          <Link href="/docs" className="hover:underline">Docs</Link>
        </div>
      </Container>
    </footer>
  );
}
