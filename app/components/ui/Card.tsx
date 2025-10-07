"use client";

import React from "react";

type Props = React.PropsWithChildren<{
  className?: string;
}> & React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = "", ...rest }: Props) {
  const base = "rounded-2xl border bg-surface text-foreground p-4 shadow-sm";
  return (
    <div className={`${base} ${className}`} {...rest}>
      {children}
    </div>
  );
}
