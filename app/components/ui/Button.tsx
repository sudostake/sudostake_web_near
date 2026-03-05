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
    "pixel-heading inline-flex items-center justify-center rounded-app border border-[color:var(--panel-border)] transition-[box-shadow,background-color,color,border-color] duration-150 ease-out disabled:opacity-60 disabled:cursor-not-allowed focus-soft";
  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-xs leading-tight",
    md: "h-10 px-3.5 text-sm leading-tight",
    lg: "h-11 px-4 text-sm leading-tight",
  };
  const variants: Record<Variant, string> = {
    primary: "btn-primary",
    secondary:
      "bg-[color:var(--surface)] text-[color:var(--text-primary)] shadow-[var(--pixel-shadow)] hover:border-[color:var(--accent-primary)] hover:bg-[color:var(--surface-muted)] hover:shadow-[var(--pixel-shadow-lg)]",
    ghost:
      "border-transparent bg-transparent text-[color:var(--text-secondary)] shadow-none hover:border-[color:var(--accent-primary)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--accent-primary)]",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
