"use client";

import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  containerClassName?: string;
  suffix?: React.ReactNode;
};

export function Input({
  label,
  hint,
  containerClassName = "",
  className = "",
  suffix,
  ...rest
}: InputProps) {
  const hasSuffix = Boolean(suffix);
  const inputBase = [
    "w-full rounded-full border bg-surface p-3 text-sm appearance-none focus-soft",
    hasSuffix ? "pr-12" : "",
  ].join(" ");
  const inputWrapperClass = ["relative", label ? "mt-1" : ""].join(" ");
  return (
    <label className={`block text-sm ${containerClassName}`}>
      {label && <span className="text-secondary-text">{label}</span>}
      <div className={inputWrapperClass}>
        <input className={`${inputBase} ${className}`} {...rest} />
        {hasSuffix && (
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-secondary-text">
            {suffix}
          </div>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-secondary-text">{hint}</div>}
    </label>
  );
}
