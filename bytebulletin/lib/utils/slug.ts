import slugifyLib from "slugify";

/**
 * Converts a string to a URL-safe slug.
 * Handles special characters, Unicode, and ensures uniqueness suffix support.
 */
export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,       // Strip special characters
    trim: true,
    locale: "en",
  });
}

/**
 * Creates a unique slug by appending a suffix if the base slug is taken.
 * @param base - The base slug to check
 * @param checkExists - Async function that returns true if slug is already taken
 */
export async function createUniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Truncates a string to a maximum length, preserving word boundaries.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, text.lastIndexOf(" ", maxLength)).concat("...");
}
