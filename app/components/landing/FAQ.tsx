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
    title: "Borrower checklist",
    description: "Walk the vault workflow step by step—from prep to repayment milestones.",
    href: "/docs/playbook",
  },
  {
    title: "Register tokens & storage",
    description: "Confirm wallets and vaults are storage-ready before you move USDC or other assets.",
    href: "/docs/token-registration",
  },
  {
    title: "Talk to the team",
    description: "Join Telegram for roadmap notes, troubleshooting, and onboarding calls.",
    href: "https://t.me/sudostake",
    external: true,
  },
];

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: "custody",
    question: "Is SudoStake fully non‑custodial?",
    answer:
      "Yes. Nothing moves until you sign it in your wallet; the contracts only execute instructions you approve on-chain.",
  },
  {
    id: "wallets",
    question: "Which wallets are supported?",
    answer:
      "Wallet Selector currently supports Bitte, Meteor, MyNearWallet, Nightly, and Ledger. We add new providers as they ship.",
  },
  {
    id: "terms",
    question: "How are loan terms enforced?",
    answer:
      "Terms live inside the vault contract. Once published, they lock in—repayments, top-ups, and liquidations all follow the parameters you set.",
  },
  {
    id: "collateral",
    question: "What collateral do I need?",
    answer: (
      <>
        Vaults hold NEAR collateral. You decide the health buffer upfront—lenders see it before committing and stronger buffers usually attract faster fills.
      </>
    ),
  },
  {
    id: "liquidation",
    question: "What if I miss repayment?",
    answer: (
      <>
        If a funded request reaches its deadline without repayment, liquidation begins. The contract moves collateral in
        batches to cover what’s owed, and dashboards surface progress so you can intervene.
      </>
    ),
  },
  {
    id: "fees",
    question: "Are there protocol fees?",
    answer: (
      <>
        Not today. You only cover NEAR gas plus one-time NEP‑141 storage deposits. If protocol fees change, the exact
        amount will appear before you approve.
      </>
    ),
  },
  {
    id: "tokens",
    question: "Which tokens are supported?",
    answer: (
      <>
        USDC is supported now. We can enable additional NEP‑141 assets—reach out if you need a specific market. Review{" "}
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
        The protocol is open-source and under ongoing review. As with any on-chain product, review the contracts yourself
        and deploy capital you’re prepared to monitor closely.
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
            <p className="text-base leading-relaxed text-secondary-text sm:text-sm">
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
                className="group rounded-2xl border border-white/12 bg-surface/85 px-5 py-5 text-sm shadow-sm transition hover:border-primary/30 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:px-6"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-base font-semibold text-foreground">{link.title}</span>
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
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-sm leading-relaxed text-secondary-text">
            Want a live walkthrough? Join Telegram to grab a slot on the next onboarding call.
          </div>
        </div>
        <div className="rounded-[28px] border border-white/12 bg-surface/90 p-4 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.6)] sm:p-6">
          <Accordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
