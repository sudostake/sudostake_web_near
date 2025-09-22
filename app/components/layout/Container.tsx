"use client";

import React from "react";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  // Align horizontal padding with Navigation (which uses px-4 on max-w-6xl)
  return <div className={`w-full max-w-6xl mx-auto px-4 ${className}`}>{children}</div>;
}
