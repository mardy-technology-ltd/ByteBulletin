/**
 * Predefined fallback categories for stock images if specific category fails.
 */
const FALLBACK_CATEGORIES = ["technology", "business", "science", "health", "sports", "world"];

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

const CATEGORY_IMAGES: Record<string, string[]> = {
  technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  ],
  business: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  ],
  science: [
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80",
  ],
  health: [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
  ],
  sports: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
  ],
  world: [
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
  ],
  news: [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
  ],
};

/**
 * Returns a deterministic fallback image URL if the original is missing or invalid.
 */
export function getArticleImage(
  originalUrl: string | null | undefined, 
  categorySlug: string = 'news',
  articleId: string = ''
): string {
  // If original URL exists and doesn't look like a tracking pixel
  if (originalUrl && originalUrl.trim() !== '' && !originalUrl.includes('1x1') && !originalUrl.includes('pixel') && !originalUrl.startsWith('data:image/svg+xml')) {
    return originalUrl;
  }

  const categoryKey = (categorySlug || 'news').toLowerCase();
  const pool = CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES.news;

  // Simple string hash for deterministic selection
  let hash = 0;
  const seedStr = articleId || 'default-seed';
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;

  return pool[index];
}

/**
 * A tiny 1x1 base64 string for image blur placeholders (slate color).
 * Use this as `blurDataURL` in Next.js Image components for a smooth blur-up effect.
 */
export const defaultBlurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/PjxfwAI8gOUQz5ZxgAAAABJRU5ErkJggg==";

/**
 * Upgrades known low-resolution image URLs to their high-resolution variants.
 * Handles BBC, WordPress thumbnails, and other common patterns.
 */
export function upgradeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  let upgradedUrl = url.trim();

  // 1. Handle BBC News (e.g., ichef.bbci.co.uk/news/240/cpsprodpb/...)
  if (upgradedUrl.includes("ichef.bbci.co.uk")) {
    // Replace resolution identifiers like /240/ or /320/ or /480/ with /1024/
    upgradedUrl = upgradedUrl.replace(/\/(?:240|320|400|480|640|800)\//, "/1024/");
  }

  // 2. Handle WordPress Thumbnails (e.g., image-150x150.jpg -> image.jpg)
  // Matches - followed by 2 to 4 digits, an 'x', 2 to 4 digits, before the extension.
  const wpThumbRegex = /-(\d{2,4})x(\d{2,4})\.(jpg|jpeg|png|webp|gif)$/i;
  if (wpThumbRegex.test(upgradedUrl)) {
    upgradedUrl = upgradedUrl.replace(wpThumbRegex, ".$3");
  }

  // 3. Handle WordPress Jetpack/Photon CDN resize params (e.g., i0.wp.com/.../image.jpg?resize=150%2C150)
  if (upgradedUrl.includes("wp.com") || upgradedUrl.includes("wp-content")) {
    upgradedUrl = upgradedUrl.replace(/([?&])(?:resize|w|h|fit)=\d+(?:%2C\d+)?/gi, "$1").replace(/[?&]&+/g, "?").replace(/[?&]$/, "");
  }

  return upgradedUrl;
}
