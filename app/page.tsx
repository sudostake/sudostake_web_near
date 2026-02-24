"use client";

import React from "react";
import { Hero } from "@/app/components/landing/Hero";
import { Container } from "@/app/components/layout/Container";
import { useRouteAccess } from "@/app/hooks/useRouteAccess";

export default function Home() {
  const { blocked } = useRouteAccess("guestOnly");
  if (blocked) return null;

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
