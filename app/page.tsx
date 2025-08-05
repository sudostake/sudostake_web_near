"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

export default function Home() {
  const { signedAccountId } = useWalletSelector();
  const router = useRouter();

  useEffect(() => {
    if (signedAccountId) {
      router.push("/dashboard");
    }
  }, [signedAccountId, router]);

  if (!signedAccountId) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="w-full max-w-2xl">
          <p className="text-center text-secondary-text">
            Please login to access your dashboard.
          </p>
        </main>
      </div>
    );
  }

  return null;
}
