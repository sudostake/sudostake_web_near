"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

export default function Dashboard() {
  const { signedAccountId } = useWalletSelector();
  const router = useRouter();

  // If user signs out (no account), redirect to no-auth home
  useEffect(() => {
    if (!signedAccountId) {
      router.replace("/");
    }
  }, [signedAccountId, router]);

  if (!signedAccountId) {
    return null;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center">Dashboard</h1>
        <p className="mt-4 text-center text-gray-700">
          Welcome, {signedAccountId}!
        </p>
      </main>
    </div>
  );
}
