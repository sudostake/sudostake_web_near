"use client";

import React from "react";

export type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="max-w-xl mx-auto p-4 bg-red-100 text-red-800 rounded-lg">
      <p className="font-medium">Error: {message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      )}
    </div>
  );
}
