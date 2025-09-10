import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from "@/utils/constants";

// Formats a short human-readable countdown like "2d 3h", "5h 10m", "45s".
export function formatDurationShort(remainingMs: number): string {
  let s = Math.floor(remainingMs / 1000);
  const days = Math.floor(s / SECONDS_PER_DAY); s -= days * SECONDS_PER_DAY;
  const hours = Math.floor(s / SECONDS_PER_HOUR); s -= hours * SECONDS_PER_HOUR;
  const minutes = Math.floor(s / 60); s -= minutes * 60;
  const seconds = s;
  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
  } else if (hours > 0) {
    parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
  } else if (minutes > 0) {
    parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
  } else {
    parts.push(`${seconds}s`);
  }
  return parts.join(" ");
}

// Returns the correct label for a number of days ("day" vs "days").
export function dayLabel(days: number): string {
  return days === 1 ? "day" : "days";
}

// Convenience: formats as "<n> day(s)" with correct pluralization.
export function formatDays(days: number): string {
  return `${days} ${dayLabel(days)}`;
}
