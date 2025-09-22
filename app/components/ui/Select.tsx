"use client";

import React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  containerClassName?: string;
};

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.855a.75.75 0 1 1 1.08 1.04l-4.24 4.41a.75.75 0 0 1-1.08 0L5.25 8.27a.75.75 0 0 1-.02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Select({
  label,
  hint,
  containerClassName = "",
  className = "",
  children,
  ...rest
}: SelectProps) {
  const base = [
    "w-full rounded border bg-background text-foreground",
    "h-9 px-2 pr-8",
    "appearance-none",
    "outline-none focus:ring-2 focus:ring-primary/50",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" ");

  return (
    <label className={`block text-sm ${containerClassName}`}>
      {label && <span className="text-secondary-text">{label}</span>}
      <div className="relative mt-1">
        <select className={`${base} ${className}`} {...rest}>
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary-text">
          <ChevronDownIcon />
        </div>
      </div>
      {hint && <div className="mt-1 text-xs text-secondary-text">{hint}</div>}
    </label>
  );
}
