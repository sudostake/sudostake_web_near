"use client";

import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  containerClassName?: string;
};

export function Input({
  label,
  hint,
  containerClassName = "",
  className = "",
  ...rest
}: InputProps) {
  const inputBase =
    "w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50";
  return (
    <label className={`block text-sm ${containerClassName}`}>
      {label && <span className="text-secondary-text">{label}</span>}
      <input className={`mt-1 ${inputBase} ${className}`} {...rest} />
      {hint && <div className="mt-1 text-xs text-secondary-text">{hint}</div>}
    </label>
  );
}

