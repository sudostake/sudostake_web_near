"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Hero } from "@/app/components/landing/Hero";
import { Features } from "@/app/components/landing/Features";
import { LandingFAQ } from "@/app/components/landing/FAQ";
import { SocialStrip } from "@/app/components/landing/SocialStrip";
import { Container } from "@/app/components/layout/Container";

export default function Home() {
  const { signedAccountId } = useWalletSelector();
  const router = useRouter();

  useEffect(() => {
    if (signedAccountId) router.push("/dashboard");
  }, [signedAccountId, router]);

  if (signedAccountId) return null;

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 font-(family-name:--font-geist-sans)">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-40vh] h-[70vh] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.22),transparent_60%)]"
      />
      <main id="main" className="relative">
        <Container className="pt-12 sm:pt-16">
          <Hero />
          <Features />
          <LandingFAQ />
          <SocialStrip />
        </Container>
      </main>
    </div>
  );
}
