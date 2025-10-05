"use client";

import React from "react";

type Props = {
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export function VisuallyHidden({ as = "span", children, className = "", ...rest }: Props) {
  return React.createElement(as, { className: `sr-only ${className}`, ...rest }, children);
}
