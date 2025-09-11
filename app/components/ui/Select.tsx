"use client";

import React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  containerClassName?: string;
};

export function Select({
  label,
  hint,
  containerClassName = "",
  className = "",
  children,
  ...rest
}: SelectProps) {
  const base = "w-full rounded border bg-background p-2 h-9 outline-none focus:ring-2 focus:ring-primary/50";
  return (
    <label className={`block text-sm ${containerClassName}`}>
      {label && <span className="text-secondary-text">{label}</span>}
      <select className={`mt-1 ${base} ${className}`} {...rest}>
        {children}
      </select>
      {hint && <div className="mt-1 text-xs text-secondary-text">{hint}</div>}
    </label>
  );
}

