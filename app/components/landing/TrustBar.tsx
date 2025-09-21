"use client";

import React from "react";

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 14L4.5 19.5a3 3 0 104.24 4.24L14.24 18M14 10l5.5-5.5a3 3 0 10-4.24-4.24L9.76 6" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrustBar() {
  const items = [
    { icon: <ShieldIcon />, label: "Non‑custodial" },
    { icon: <ChainIcon />, label: "On‑chain transparency" },
    { icon: <CodeIcon />, label: "Open‑source" },
  ];
  return (
    <div className="mt-6 text-xs text-secondary-text" aria-labelledby="trust-heading">
      <span id="trust-heading" className="sr-only">Trust indicators</span>
      <ul className="list-none m-0 p-0 flex flex-wrap items-center justify-center gap-4">
        {items.map((i) => (
          <li key={i.label} className="inline-flex items-center gap-2 rounded border bg-surface px-3 py-1.5">
            {i.icon}
            <span>{i.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
