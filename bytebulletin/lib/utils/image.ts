/**
 * High-quality fallback images from Unsplash curated by category.
 */
const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  technology: ["#4F46E5", "#06B6D4"], // Indigo to Cyan
  business: ["#0F172A", "#334155"],   // Slate Dark
  science: ["#7C3AED", "#EC4899"],    // Violet to Pink
  health: ["#10B981", "#3B82F6"],     // Emerald to Blue
  sports: ["#F97316", "#EAB308"],     // Orange to Yellow
  world: ["#0369A1", "#0284C7"],      // Ocean Blue
  default: ["#6366F1", "#8B5CF6"],    // Indigo to Violet
};

/**
 * Generates a beautiful SVG gradient data URI.
 */
function generateGradientSvg(color1: string, color2: string, text: string = ""): string {
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      ${text ? `<text x="50%" y="50%" font-family="sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.5">${text}</text>` : ''}
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg.trim()).toString('base64')}`;
}

/**
 * Returns a deterministic fallback image URL if the original is missing or invalid.
 */
export function getArticleImage(
  originalUrl: string | null | undefined, 
  categorySlug: string = 'default',
  articleId: string = ''
): string {
  // If original URL exists and doesn't look like a tracking pixel
  if (originalUrl && originalUrl.trim() !== '' && !originalUrl.includes('1x1') && !originalUrl.includes('pixel')) {
    return originalUrl;
  }

  const normalizedCategory = categorySlug.toLowerCase();
  const [c1, c2] = CATEGORY_GRADIENTS[normalizedCategory] || CATEGORY_GRADIENTS['default'];
  
  const label = normalizedCategory !== 'default' 
    ? normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)
    : 'ByteBulletin';

  return generateGradientSvg(c1, c2, label);
}

/**
 * A tiny 1x1 base64 string for image blur placeholders (slate color).
 * Use this as `blurDataURL` in Next.js Image components for a smooth blur-up effect.
 */
export const defaultBlurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/PjxfwAI8gOUQz5ZxgAAAABJRU5ErkJggg==";
