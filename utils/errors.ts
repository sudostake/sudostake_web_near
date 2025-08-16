/**
 * Map raw errors to user-friendly messages.
 */
export function getFriendlyErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    // Customize known error messages here if needed.
    return e.message;
  }
  return "An unexpected error occurred. Please try again.";
}
