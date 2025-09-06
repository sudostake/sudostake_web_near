"use client";

import React from "react";

export default function TokenRegistrationDoc() {
  return (
    <div className="min-h-screen p-6 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold">What is token registration?</h1>
        <p className="mt-3 text-sm text-secondary-text">
          NEP-141 fungible token contracts on NEAR require accounts to pay a small storage deposit before the
          contract can store balance data for them. This is often called “registration” and is performed by calling
          <code className="mx-1">storage_deposit</code> on the token contract.
        </p>

        <section className="mt-6 space-y-3 text-sm leading-6">
          <h2 className="text-base font-medium">Why registration is required</h2>
          <p>
            Token contracts maintain per-account state (balances, allowances). To prevent storage-abuse, contracts
            require each account to cover the cost of storing its own data with a one-time deposit in NEAR. If an
            account isn’t registered, token transfers to or from that account may fail.
          </p>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-6">
          <h2 className="text-base font-medium">Who needs to register?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              The receiver account (e.g., your vault) must be registered with the token to receive tokens via
              <code className="mx-1">ft_transfer_call</code>.
            </li>
            <li>
              The sender account (e.g., a lender) typically must be registered as well to hold a balance with the token
              they intend to send.
            </li>
          </ul>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-6">
          <h2 className="text-base font-medium">How to register</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Call <code className="mx-1">storage_balance_bounds</code> on the token to read the minimum deposit required.</li>
            <li>
              Call <code className="mx-1">storage_deposit</code> attaching the minimum (or more) NEAR deposit. Many UIs (including
              this one) offer a button to do this for you when needed.
            </li>
          </ol>
          <p>
            Registration is usually one-time per token per account. If you unregister or the token contract refunds
            storage, you may need to register again before using it.
          </p>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-6">
          <h2 className="text-base font-medium">Costs and refunds</h2>
          <p>
            The storage deposit is held by the token contract to cover your on-chain storage. If your token-related
            storage footprint shrinks (e.g., you remove allowances and your balance goes to zero), some contracts
            allow you to reclaim part of the deposit via <code className="mx-1">storage_unregister</code>.
          </p>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-6">
          <h2 className="text-base font-medium">Troubleshooting</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Transfer failed with a message about “storage” — register the account with the token first.</li>
            <li>
              Unsure which account to register? Receivers of <code className="mx-1">ft_transfer_call</code> must be registered on the
              token, and senders should be registered to hold the token balance.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

