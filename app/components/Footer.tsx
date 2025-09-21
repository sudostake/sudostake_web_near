"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="px-4 py-8 md:mx-auto md:max-w-2xl text-sm text-secondary-text flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>© {new Date().getFullYear()} SudoStake — non‑custodial vaults</div>
        <div className="flex items-center gap-4">
          <Link href="/discover" className="hover:underline">Discover</Link>
          <Link href="/docs/token-registration" className="hover:underline">Docs</Link>
        </div>
      </div>
    </footer>
  );
}
