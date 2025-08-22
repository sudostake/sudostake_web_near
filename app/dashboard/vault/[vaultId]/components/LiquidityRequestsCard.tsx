"use client";

import React from "react";

export function LiquidityRequestsCard() {
  return (
    <section className="rounded border bg-surface p-8 flex items-center justify-center text-center">
      <div>
        <div className="coin-scene mx-auto">
          <div className="coin" aria-hidden="true">
            <div className="face front" />
            <div className="face back" />
          </div>
        </div>
        <div className="mt-3 text-base font-medium">Access USDC backed by your staked tokens</div>
      </div>
      <style jsx>{`
        .coin-scene {
          width: 48px;
          height: 48px;
          perspective: 800px;
        }
        .coin {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: coin-spin 12s linear infinite;
          will-change: transform;
        }
        .face {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          backface-visibility: hidden;
        }
        .front { background-image: url('/usdc.png'); }
        .back { background-image: url('/near.svg'); transform: rotateY(180deg); }
        @keyframes coin-spin {
          0%   { transform: rotateX(6deg) rotateY(0deg); }
          50%  { transform: rotateX(6deg) rotateY(180deg); }
          100% { transform: rotateX(6deg) rotateY(360deg); }
        }
      `}</style>
    </section>
  );
}
