"use client";

import React from "react";
import { Accordion, AccordionItem } from "@/app/components/ui/Accordion";

export function LandingFAQ() {
  const items: AccordionItem[] = [
    {
      id: "custody",
      question: "Is this non‑custodial?",
      answer:
        "Yes. You approve transactions in your wallet; smart contracts enforce terms on‑chain. Your keys, your assets.",
    },
    {
      id: "wallets",
      question: "Which wallets are supported?",
      answer:
        "Bitte, Meteor, MyNearWallet, Nightly, and Ledger via Wallet Selector. More can be added over time.",
    },
    {
      id: "terms",
      question: "How are loan terms enforced?",
      answer:
        "Terms are part of the contract call and state. Repayments and liquidations follow the contract logic; every step is traceable on‑chain.",
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

