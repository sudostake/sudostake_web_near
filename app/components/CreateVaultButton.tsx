"use client";

import React from "react";

export function CreateVaultButton({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-text rounded hover:opacity-90 whitespace-nowrap shrink-0 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M12 4.5a1 1 0 011 1V11h5.5a1 1 0 110 2H13v5.5a1 1 0 11-2 0V13H5.5a1 1 0 110-2H11V5.5a1 1 0 011-1z" />
      </svg>
      <span className="whitespace-nowrap">Create New Vault</span>
    </button>
  );
}
