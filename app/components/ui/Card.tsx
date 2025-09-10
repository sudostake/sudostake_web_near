"use client";

import React from "react";

type Props = React.PropsWithChildren<{
  className?: string;
}> & React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = "", ...rest }: Props) {
  const base = "rounded border border-foreground/20 bg-background/80 text-foreground p-3 dark:bg-background/60";
  return (
    <div className={`${base} ${className}`} {...rest}>
      {children}
    </div>
  );
}

