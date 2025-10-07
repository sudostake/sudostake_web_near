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
    "inline-flex items-center justify-center rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary/40";
  const sizes: Record<Size, string> = {
    sm: "px-2.5 h-8 text-sm",
    md: "px-3 h-9 text-sm",
    lg: "px-4 h-10 text-base",
  };
  const variants: Record<Variant, string> = {
    primary: "bg-primary text-primary-text hover:bg-primary/90",
    secondary: "border bg-surface hover:bg-surface/90",
    ghost: "hover:bg-foreground/10",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
