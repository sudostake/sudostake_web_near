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
    title: "Borrower playbook",
    description: "See the full journey from creating a vault to completing repayment.",
    href: "/docs/playbook",
  },
  {
    title: "Register a token",
    description: "Understand storage deposits and how assets become available inside SudoStake.",
    href: "/docs/token-registration",
  },
  {
    title: "Talk with the core team",
    description: "Join the Telegram channel to get help, roadmaps, and release notes.",
    href: "https://t.me/sudostake",
    external: true,
  },
];

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: "custody",
    question: "Is this non‑custodial?",
    answer:
      "Yes. You approve every transaction in your wallet. The contract enforces terms on-chain, so funds move only when you confirm.",
  },
  {
    id: "wallets",
    question: "Which wallets are supported?",
    answer:
      "Bitte, Meteor, MyNearWallet, Nightly, and Ledger via Wallet Selector today. More wallets can be added over time.",
  },
  {
    id: "terms",
    question: "How are loan terms enforced?",
    answer:
      "Terms live in the contract. Repayments and liquidations follow that logic step by step, so you can trace every action on-chain.",
  },
  {
    id: "collateral",
    question: "What collateral do I need?",
    answer: (
      <>
        Vaults lock NEAR as collateral. The amount you must lock depends on the terms you choose and lender appetite.
      </>
    ),
  },
  {
    id: "liquidation",
    question: "What if I miss repayment?",
    answer: (
      <>
        If a request is funded and you don’t repay on time, the contract follows the rules and may liquidate collateral to
        cover the shortfall.
      </>
    ),
  },
  {
    id: "fees",
    question: "Are there protocol fees?",
    answer: (
      <>
        You pay normal network gas. First-time FT actions may need a small storage deposit. If protocol fees are introduced,
        they appear in the UI before you confirm.
      </>
    ),
  },
  {
    id: "tokens",
    question: "Which tokens are supported?",
    answer: (
      <>
        USDC is supported today. Additional NEP‑141 tokens can be added over time. See{" "}
        <Link href="/docs/token-registration" className="underline">
          token registration
        </Link>{" "}
        for details.
      </>
    ),
  },
  {
    id: "audit",
    question: "Has the code been audited?",
    answer: (
      <>
        The project is open‑source. As with any on‑chain protocol, use at your own risk. Review the code and only risk what
        you can afford to lose.
      </>
    ),
  },
];

export function LandingFAQ() {
  return (
    <section className="mt-28 border-t border-white/10 pt-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr),minmax(280px,0.8fr)]">
        <div className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-[clamp(1.6rem,2.4vw,2.1rem)] font-semibold text-foreground">Frequently asked questions</h2>
            <p className="text-sm leading-relaxed text-secondary-text">
              Start with the essentials before you connect your wallet. Each answer links to deeper documentation when you
              need it.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="group rounded-2xl border border-white/12 bg-surface/85 px-5 py-4 text-sm shadow-sm transition hover:border-primary/30 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-foreground">{link.title}</span>
                  <span
                    aria-hidden="true"
                    className="text-base text-secondary-text transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1"
                  >
                    →
                  </span>
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-secondary-text">{link.description}</span>
              </Link>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-xs leading-relaxed text-secondary-text">
            Prefer a live walkthrough? We host onboarding calls every other week—drop into Telegram to reserve a slot.
          </div>
        </div>
        <div className="rounded-[28px] border border-white/12 bg-surface/90 p-4 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.6)] sm:p-6">
          <Accordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
