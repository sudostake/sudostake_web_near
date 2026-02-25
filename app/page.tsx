"use client";

import React from "react";
import { Hero } from "@/app/components/landing/Hero";
import { Container } from "@/app/components/layout/Container";
import { useRouteAccess } from "@/app/hooks/useRouteAccess";

export default function Home() {
  const { blocked } = useRouteAccess("guestOnly");
  if (blocked) return null;

  return (
    <div className="min-h-screen pb-20 text-[color:var(--text-primary)]">
      <main id="main">
        <Container className="pt-8 sm:pt-10 lg:pt-12">
          <Hero />
        </Container>
      </main>
    </div>
  );
}
