import { formatDistanceToNow, format, parseISO, isValid } from "date-fns";

/**
 * Returns a human-readable relative time string (e.g., "3 hours ago").
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Unknown date";
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Formats a date for display in article headers (e.g., "July 20, 2026").
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Unknown date";
  return format(d, "MMMM d, yyyy");
}

/**
 * Formats a date for datetime attributes (ISO 8601).
 */
export function formatDatetime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return d.toISOString();
}

/**
 * Estimates article reading time in minutes based on word count.
 * Uses average adult reading speed of 225 words per minute.
 */
export function estimateReadingTime(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 225);
  return Math.max(1, minutes);
}
