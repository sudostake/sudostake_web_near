"use client";
import React from "react";

type Props = {
  label: React.ReactNode;
  value?: React.ReactNode;
  mono?: boolean;
  className?: string;
};

export function LabelValue({ label, value, mono, className = "" }: Props) {
  return (
    <div className={className}>
      <div className="pixel-heading text-[0.52rem] text-secondary-text">{label}</div>
      {value !== undefined && (
        <div className={`${mono ? "font-mono" : "font-medium"} text-sm leading-relaxed text-foreground`}>{value}</div>
      )}
    </div>
  );
}
