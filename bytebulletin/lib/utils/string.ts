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

/**
 * Decodes common HTML entities (e.g. &#8217;, &amp;, &quot;) into their plain text equivalents.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&#39;": "'",
    "&#34;": '"',
    "&#8216;": "'",
    "&#8217;": "'",
    "&#8220;": '"',
    "&#8221;": '"',
    "&#8211;": "-",
    "&#8212;": "--",
    "&#160;": " ",
    "&nbsp;": " ",
  };

  return text.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
    if (entities[match]) return entities[match];
    const decimalMatch = match.match(/&#(\d+);/);
    if (decimalMatch) return String.fromCharCode(parseInt(decimalMatch[1], 10));
    const hexMatch = match.match(/&#x([a-fA-F0-9]+);/);
    if (hexMatch) return String.fromCharCode(parseInt(hexMatch[1], 16));
    return match;
  });
}
