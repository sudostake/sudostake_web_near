"use client";

import React from "react";
import Link from "next/link";
import { Accordion, AccordionItem } from "@/app/components/ui/Accordion";

export function LandingFAQ() {
  const items: AccordionItem[] = [
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
          If a request is funded and you don’t repay on time, the contract follows the rules and may liquidate collateral to cover the shortfall.
        </>
      ),
    },
    {
      id: "fees",
      question: "Are there protocol fees?",
      answer: (
        <>
          You pay normal network gas. First-time FT actions may need a small storage deposit. If we add protocol fees, they appear in the UI before you confirm.
        </>
      ),
    },
    {
      id: "tokens",
      question: "Which tokens are supported?",
      answer: (
        <>
          USDC is supported today. Additional NEP‑141 tokens can be added over time. See <Link href="/docs/token-registration" className="underline">token registration</Link> for details.
        </>
      ),
    },
    {
      id: "audit",
      question: "Has the code been audited?",
      answer: (
        <>
          The project is open‑source. As with any on‑chain protocol, use at your own risk. Review the code and only risk what you can afford to lose.
        </>
      ),
    },
  ];

  return (
    <section className="mt-24 border-t pt-12">
      <div className="max-w-2xl">
        <h2 className="text-[clamp(1.45rem,2.2vw,1.9rem)] font-semibold">Frequently asked questions</h2>
        <p className="mt-3 text-sm text-secondary-text">
          Start with the essentials before connecting your wallet.
        </p>
      </div>
      <div className="mt-6 rounded-xl border bg-surface p-4 sm:p-6">
        <Accordion items={items} />
      </div>
    </section>
  );
}
