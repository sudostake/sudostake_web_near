"use client";

import React from "react";

export function Divider({ className = "" }: { className?: string }) {
  return <div className={`my-10 border-t ${className}`} aria-hidden="true" />;
}
