"use client";

import React from "react";
import Link from "next/link";
import { Accordion, AccordionItem } from "@/app/components/ui/Accordion";

type QuickLink = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

const QUICK_LINKS: QuickLink[] = [
  {
    title: "Start as borrower",
    description: "Use the checklist, then create a vault and open your first request.",
    href: "/dashboard",
  },
  {
    title: "Review live requests",
    description: "Open Discover and compare current terms before you fund.",
    href: "/discover",
  },
  {
    title: "Fix setup blockers",
    description: "Check token storage requirements before moving USDC.",
    href: "/docs/token-registration",
  },
];

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: "custody",
    question: "Do I approve transactions in my wallet?",
    answer:
      "Yes. State-changing actions in the app (create vault, request liquidity, accept, repay, and process claims) all require wallet confirmation.",
  },
  {
    id: "wallets",
    question: "Which wallets are supported?",
    answer:
      "Wallet Selector is configured for Bitte, Meteor, MyNearWallet, Nightly, and Ledger in the current app.",
  },
  {
    id: "browse",
    question: "Can I use the app before connecting a wallet?",
    answer:
      "Yes. You can browse Discover and vault pages in read-only mode. Connecting is required to create vaults, fund requests, or run owner and lender actions.",
  },
  {
    id: "terms",
    question: "Can an open request be changed?",
    answer:
      "A pending request can be canceled and replaced with a new one. After a lender accepts, the active loan follows the accepted amount, interest, collateral, and duration.",
  },
  {
    id: "collateral",
    question: "What collateral do I need?",
    answer: "Requests use NEAR collateral, and the request form caps collateral by your vault's current staked balance.",
  },
  {
    id: "liquidation",
    question: "What happens when a loan term expires?",
    answer:
      "After expiry, repayment is still possible until liquidation starts. Then the lender or owner can call process_claims to start or continue claim payouts, which may complete over multiple epochs.",
  },
  {
    id: "fees",
    question: "What costs should I expect?",
    answer: (
      <>
        Your wallet shows exact gas and deposits before approval. In-app flows currently include a one-time vault creation
        deposit and one-time NEP-141 storage deposits when accounts are not registered.
      </>
    ),
  },
  {
    id: "tokens",
    question: "Which token can borrowers request today?",
    answer: (
      <>
        The request form is currently fixed to the default USDC token for the selected network. Review{" "}
        <Link href="/docs/token-registration" className="underline">
          token registration
        </Link>{" "}
        before funding or withdrawing.
      </>
    ),
  },
];

export function LandingFAQ() {
  return (
    <section className="mt-28 border-t-2 border-[color:var(--panel-border)] pt-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr),minmax(280px,0.8fr)]">
        <div className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="section-heading text-foreground">Questions before you start?</h2>
            <p className="text-base leading-relaxed text-secondary-text sm:text-sm">
              Use these quick answers to unblock your next action.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="group surface-panel px-5 py-5 text-sm transition hover:border-primary/30 hover:bg-[color:var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:px-6"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="pixel-heading text-[0.62rem] text-foreground">{link.title}</span>
                  <span
                    aria-hidden="true"
                    className="text-base text-secondary-text transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1"
                  >
                    →
                  </span>
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-secondary-text">{link.description}</span>
              </Link>
            ))}
          </div>
          <div className="surface-panel border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-sm leading-relaxed text-secondary-text">
            Need live help? Join Telegram for troubleshooting and onboarding support.
          </div>
        </div>
        <Accordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
