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
        "Yes. You approve every transaction in your wallet. The smart contract enforces the terms on‑chain. Your keys, your assets.",
    },
    {
      id: "wallets",
      question: "Which wallets are supported?",
      answer:
        "We support Bitte, Meteor, MyNearWallet, Nightly, and Ledger (via Wallet Selector). More can be added over time.",
    },
    {
      id: "terms",
      question: "How are loan terms enforced?",
      answer:
        "Terms live in the contract. Repayments and liquidations follow the contract logic. Every step is traceable on‑chain.",
    },
    {
      id: "collateral",
      question: "What collateral is used?",
      answer: (
        <>
          Vaults lock NEAR as collateral. The amount you must lock depends on the terms you choose and lender appetite.
        </>
      ),
    },
    {
      id: "liquidation",
      question: "What happens if I don’t repay?",
      answer: (
        <>
          If a request is funded and you don’t repay within the agreed term, the contract settles according to the rules and may liquidate collateral to cover obligations.
        </>
      ),
    },
    {
      id: "fees",
      question: "Are there any fees?",
      answer: (
        <>
          You pay normal network gas fees, and some interactions (like first‑time FT use) require a small storage registration deposit. Any protocol fees would be shown in the UI when applicable.
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
    <section className="mt-12 md:mt-16">
      <h2 className="text-[clamp(1.25rem,2.1vw,1.75rem)] font-semibold">FAQ</h2>
      <div className="mt-4 rounded-xl border bg-surface/50 p-4 sm:p-6">
        <Accordion items={items} />
      </div>
    </section>
  );
}
