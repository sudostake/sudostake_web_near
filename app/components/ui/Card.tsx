"use client";

import React from "react";

type Props = React.PropsWithChildren<{
  className?: string;
}> & React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = "", ...rest }: Props) {
  const base = "surface-card rounded-app bg-surface p-5 text-foreground sm:p-6";
  return (
    <div className={`${base} ${className}`} {...rest}>
      {children}
    </div>
  );
}
