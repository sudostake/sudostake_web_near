"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Hero } from "@/app/components/landing/Hero";
import { HowItWorks } from "@/app/components/landing/HowItWorks";
import { Features } from "@/app/components/landing/Features";
import { LandingFAQ } from "@/app/components/landing/FAQ";
import { Container } from "@/app/components/layout/Container";

export default function Home() {
  const { signedAccountId } = useWalletSelector();
  const router = useRouter();

  useEffect(() => {
    if (signedAccountId) router.push("/dashboard");
  }, [signedAccountId, router]);

  if (signedAccountId) return null;

  return (
    <div className="min-h-screen pb-20 font-[family-name:var(--font-geist-sans)]">
      <main id="main">
        <Container>
          <Hero />
          <Features />
          <HowItWorks />
          <LandingFAQ />
        </Container>
      </main>
    </div>
  );
}
