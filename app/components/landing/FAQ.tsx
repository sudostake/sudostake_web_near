"use client";

import React from "react";
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
  ];

  return (
    <section className="mt-10">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="mt-3">
          <Accordion items={items} />
        </div>
      </div>
    </section>
  );
}
