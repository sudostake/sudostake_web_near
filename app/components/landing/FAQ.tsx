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
    description: "Follow the complete vault workflow with checklists for each milestone.",
    href: "/docs/playbook",
  },
  {
    title: "Register a token",
    description: "Make sure wallets and vaults are storage-registered before moving USDC.",
    href: "/docs/token-registration",
  },
  {
    title: "Chat with the team",
    description: "Drop into Telegram for roadmap notes, troubleshooting, and office hours.",
    href: "https://t.me/sudostake",
    external: true,
  },
];

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: "custody",
    question: "Is SudoStake fully non‑custodial?",
    answer:
      "Yes. Every action—even automated ones—pauses until your wallet approves it. The contracts only execute instructions you sign on-chain.",
  },
  {
    id: "wallets",
    question: "Which wallets are supported?",
    answer:
      "Bitte, Meteor, MyNearWallet, Nightly, and Ledger are available through Wallet Selector. We add new providers as they land.",
  },
  {
    id: "terms",
    question: "How are loan terms enforced?",
    answer:
      "Terms live inside the vault contract. Once you publish them, they cannot be edited, and every repayment or liquidation step follows those parameters.",
  },
  {
    id: "collateral",
    question: "What collateral do I need?",
    answer: (
      <>
        Vaults hold NEAR collateral. Set the health buffer you’re comfortable with—lenders can see it before committing, and healthier buffers typically attract faster fills.
      </>
    ),
  },
  {
    id: "liquidation",
    question: "What if I miss repayment?",
    answer: (
      <>
        If a funded request reaches its deadline without repayment, liquidation can begin. The contract moves collateral in
        batches to cover the outstanding amount, and dashboards surface progress so you can intervene.
      </>
    ),
  },
  {
    id: "fees",
    question: "Are there protocol fees?",
    answer: (
      <>
        Not today. You only cover NEAR gas plus one-time NEP‑141 storage deposits. If protocol fees ever change, the exact
        amount appears before you approve.
      </>
    ),
  },
  {
    id: "tokens",
    question: "Which tokens are supported?",
    answer: (
      <>
        USDC is supported now. We can enable additional NEP‑141 assets—ping the team if you need a specific market. Review{" "}
        <Link href="/docs/token-registration" className="underline">
          token registration
        </Link>{" "}
        before moving a new token.
      </>
    ),
  },
  {
    id: "audit",
    question: "Has the code been audited?",
    answer: (
      <>
        The protocol is open-source and under ongoing review. As with any on-chain product, audit the contracts yourself and
        deploy capital you’re prepared to monitor closely.
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
              Skim the essentials before connecting your wallet. Each answer links to deeper documentation when you want
              more depth.
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
            Prefer a live walkthrough? We host onboarding calls every other week—join Telegram to grab a slot.
          </div>
        </div>
        <div className="rounded-[28px] border border-white/12 bg-surface/90 p-4 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.6)] sm:p-6">
          <Accordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
