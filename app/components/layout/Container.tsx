"use client";

import React from "react";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  // Align horizontal padding with Navigation (which uses px-4 on max-w-6xl)
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}
