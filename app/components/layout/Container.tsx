"use client";

import React from "react";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full max-w-2xl mx-auto ${className}`}>{children}</div>;
}

