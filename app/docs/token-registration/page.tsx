"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { Container } from "@/app/components/layout/Container";

export default function TokenRegistrationDoc() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main>
        <Container>
        <SectionHeader
          title="What is token registration?"
          caption="NEP-141 tokens require a small storage deposit per account."
        />
        <p className="mt-3 text-sm text-secondary-text">
          NEP-141 fungible token contracts on NEAR require accounts to pay a small storage deposit before the
          contract can store balance data for them. This is often called “registration” and is performed by calling
          <code className="mx-1">storage_deposit</code> on the token contract.
        </p>

        <Card className="mt-6 text-sm leading-6">
          <h2 className="text-base font-medium text-foreground">Why registration is required</h2>
          <p className="mt-2 text-secondary-text">
            Token contracts maintain per-account state (balances, allowances). To prevent storage-abuse, contracts
            require each account to cover the cost of storing its own data with a one-time deposit in NEAR. If an
            account isn’t registered, token transfers to or from that account may fail.
          </p>
        </Card>

        <Card className="mt-4 text-sm leading-6">
          <h2 className="text-base font-medium text-foreground">Who needs to register?</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-secondary-text">
            <li>
              The receiver account (e.g., your vault) must be registered with the token to receive tokens via
              <code className="mx-1">ft_transfer_call</code>.
            </li>
            <li>
              The sender account (e.g., a lender) typically must be registered as well to hold a balance with the token
              they intend to send.
            </li>
          </ul>
        </Card>

        <Card className="mt-4 text-sm leading-6">
          <h2 className="text-base font-medium text-foreground">How to register</h2>
          <ol className="mt-2 list-decimal pl-5 space-y-1 text-secondary-text">
            <li>Call <code className="mx-1">storage_balance_bounds</code> on the token to read the minimum deposit required.</li>
            <li>
              Call <code className="mx-1">storage_deposit</code> attaching the minimum (or more) NEAR deposit. Many UIs (including
              this one) offer a button to do this for you when needed.
            </li>
          </ol>
          <p className="mt-2 text-secondary-text">
            Registration is usually one-time per token per account. If you unregister or the token contract refunds
            storage, you may need to register again before using it.
          </p>
        </Card>

        <Card className="mt-4 text-sm leading-6">
          <h2 className="text-base font-medium text-foreground">Costs and refunds</h2>
          <p className="mt-2 text-secondary-text">
            The storage deposit is held by the token contract to cover your on-chain storage. If your token-related
            storage footprint shrinks (e.g., you remove allowances and your balance goes to zero), some contracts
            allow you to reclaim part of the deposit via <code className="mx-1">storage_unregister</code>.
          </p>
        </Card>

        <Card className="mt-4 text-sm leading-6">
          <h2 className="text-base font-medium text-foreground">Troubleshooting</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-secondary-text">
            <li>Transfer failed with a message about “storage” — register the account with the token first.</li>
            <li>
              Unsure which account to register? Receivers of <code className="mx-1">ft_transfer_call</code> must be registered on the
              token, and senders should be registered to hold the token balance.
            </li>
          </ul>
        </Card>
        </Container>
      </main>
    </div>
  );
}
