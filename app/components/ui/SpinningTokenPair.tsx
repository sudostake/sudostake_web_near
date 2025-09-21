"use client";

import React from "react";

type Props = {
  size?: number; // px
  frontSrc?: string; // default USDC
  backSrc?: string; // default NEAR coin
  durationSec?: number; // animation duration seconds
  className?: string;
  ariaLabel?: string; // accessible label; omit to treat as decorative
  title?: string; // optional sr-only title
  respectReducedMotion?: boolean; // disable animation for prefers-reduced-motion
  pauseOnHover?: boolean; // pause animation on hover/focus
};

export function SpinningTokenPair({
  size = 44,
  frontSrc = "/usdc.svg",
  backSrc = "/near-coin.svg",
  durationSec = 12,
  className = "",
  ariaLabel,
  title,
  respectReducedMotion = true,
  pauseOnHover = false,
}: Props) {
  const dim = `${size}px`;
  const dur = `${durationSec}s`;
  const ariaProps = ariaLabel
    ? ({ role: "img", "aria-label": ariaLabel } as const)
    : ({ "aria-hidden": true } as const);
  // Conditionally add a class to enable pause-on-hover styles
  const wrapperClass = [className, pauseOnHover ? "stp-pause" : null].filter(Boolean).join(" ");
  return (
    <div className={wrapperClass} {...ariaProps}>
      <div className="stp-scene" style={{ width: dim, height: dim }}>
        <div className="stp-coin" style={{ animationDuration: dur }}>
          <div className="stp-face stp-front" style={{ backgroundImage: `url(${frontSrc})` }} />
          <div className="stp-face stp-back" style={{ backgroundImage: `url(${backSrc})` }} />
        </div>
      </div>
      {title && ariaLabel && <span className="sr-only">{title}</span>}
      <style jsx>{`
        .stp-scene { perspective: 800px; }
        .stp-coin { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; -webkit-transform-style: preserve-3d; animation-name: stp-spin; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        .stp-face { position: absolute; inset: 0; background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 50%; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .stp-back { transform: rotateY(180deg); }
        @keyframes stp-spin { 0% { transform: rotateX(6deg) rotateY(0deg);} 50% { transform: rotateX(6deg) rotateY(180deg);} 100% { transform: rotateX(6deg) rotateY(360deg);} }
        .stp-pause:hover .stp-coin, .stp-pause:focus-within .stp-coin { animation-play-state: paused; }
        ${respectReducedMotion ? `@media (prefers-reduced-motion: reduce) { .stp-coin { animation: none !important; } }` : ""}
      `}</style>
    </div>
  );
}
