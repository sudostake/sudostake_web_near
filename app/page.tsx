"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Hero } from "@/app/components/landing/Hero";
import { Container } from "@/app/components/layout/Container";

export default function Home() {
  const { signedAccountId } = useWalletSelector();
  const router = useRouter();

  useEffect(() => {
    if (signedAccountId) router.push("/dashboard");
  }, [signedAccountId, router]);

  if (signedAccountId) return null;

  return (
    <div className="min-h-screen pb-16">
      <main id="main">
        <Container className="pt-12 sm:pt-16">
          <Hero />
        </Container>
      </main>
    </div>
  );
}
