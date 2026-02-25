"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "pixel-heading inline-flex items-center justify-center rounded-app border-2 border-[color:var(--panel-border)] transition-[transform,box-shadow,background-color,color,border-color] duration-150 [transition-timing-function:steps(2,end)] disabled:opacity-60 disabled:cursor-not-allowed focus-soft";
  const sizes: Record<Size, string> = {
    sm: "h-8 px-2.5 text-[0.58rem] leading-none",
    md: "h-9 px-3 text-[0.62rem] leading-none",
    lg: "h-10 px-4 text-[0.66rem] leading-none",
  };
  const variants: Record<Variant, string> = {
    primary: "btn-primary",
    secondary:
      "bg-[color:var(--surface)] text-[color:var(--text-primary)] shadow-[var(--pixel-shadow)] hover:border-[color:var(--accent-primary)] hover:bg-[color:var(--surface-muted)] hover:translate-y-[2px] hover:shadow-none",
    ghost:
      "border-transparent bg-transparent text-[color:var(--text-secondary)] shadow-none hover:border-[color:var(--accent-primary)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--accent-primary)]",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
