"use client";

import React from "react";

export default function BackToTop({ threshold = 300 }: { threshold?: number }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 rounded-full border bg-primary text-primary-text shadow px-3 py-2 text-sm"
      aria-label="Back to top"
    >
      Top
    </button>
  );
}

