"use client";

import React from "react";

type Props = React.PropsWithChildren<{
  className?: string;
}> & React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = "", ...rest }: Props) {
  const base = "rounded border bg-surface text-foreground p-3";
  return (
    <div className={`${base} ${className}`} {...rest}>
      {children}
    </div>
  );
}
