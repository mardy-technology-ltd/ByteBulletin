/**
 * Strips HTML tags from a string (for RSS excerpt extraction).
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Generates a meta description from an article excerpt.
 * Truncates to 155 characters (Google's recommended limit).
 */
export function toMetaDescription(text: string): string {
  const clean = stripHtml(text);
  if (clean.length <= 155) return clean;
  return clean.slice(0, 152).trimEnd() + "...";
}

/**
 * Extracts tags from a comma-separated or array of strings.
 * Normalises: lowercase, trim, remove duplicates.
 */
export function normalizeTags(tags: string | string[]): string[] {
  const raw = Array.isArray(tags)
    ? tags
    : tags.split(",");

  return [...new Set(raw.map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

/**
 * Capitalises the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Returns initials from a name string (max 2 chars).
 * Used for avatar fallbacks.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
