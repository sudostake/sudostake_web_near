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
    if (signedAccountId) router.replace("/dashboard");
  }, [signedAccountId, router]);

  if (signedAccountId) return null;

  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-36vh] h-[64vh] bg-[radial-gradient(ellipse_at_top,rgba(15,118,110,0.22),transparent_70%)]"
      />
      <main id="main" className="relative">
        <Container className="pt-8 sm:pt-10 lg:pt-12">
          <Hero />
        </Container>
      </main>
    </div>
  );
}
