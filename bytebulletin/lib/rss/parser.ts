import Parser from "rss-parser";
import sanitizeHtml from "sanitize-html";
import { parse as parseUrl } from "url";
import { decodeHtmlEntities } from "@/lib/utils/string";

// Custom fields to extract from RSS items
type CustomItem = {
  "content:encoded"?: string;
  "media:content"?: { $: { url: string; medium?: string } };
  "media:thumbnail"?: { $: { url: string } };
  enclosure?: { url: string; type: string };
  description?: string;
  creator?: string;
  "dc:creator"?: string;
};

const parser = new Parser<any, CustomItem>({
  customFields: {
    item: [
      ["content:encoded", "content:encoded"],
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["dc:creator", "dc:creator"],
    ],
  },
  timeout: 10000, // 10 seconds
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
});

export interface ParsedArticle {
  title: string;
  originalUrl: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: Date;
  tags: string[];
}

/**
 * Strips bad HTML and ensures only safe tags are kept.
 */
function cleanHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "b", "i", "em", "strong", "a", "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "img", "br", "hr"
    ],
    allowedAttributes: {
      a: ["href", "name", "target"],
      img: ["src", "alt", "width", "height"],
    },
  });
}

/**
 * Extracts a plain text excerpt from HTML content.
 */
function extractExcerpt(html: string, length = 150): string {
  const text = sanitizeHtml(html, {
    allowedTags: [], // Strip all tags
    allowedAttributes: {},
  });
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
}

function extractImageUrl(item: any): string | null {
  const candidates: string[] = [];

  // Helper to extract url from media items
  const pushMediaUrl = (mediaObj: any) => {
    if (!mediaObj) return;
    if (Array.isArray(mediaObj)) {
      mediaObj.forEach(pushMediaUrl);
    } else if (mediaObj.$?.url) {
      candidates.push(mediaObj.$.url);
    } else if (typeof mediaObj.url === "string") {
      candidates.push(mediaObj.url);
    }
  };

  // 1. Enclosure
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image/")) {
    candidates.push(item.enclosure.url);
  }

  // 2. Media Content
  pushMediaUrl(item["media:content"]);

  // 3. Media Thumbnail
  pushMediaUrl(item["media:thumbnail"]);

  // 4. Try parsing <img> tag attributes (src, data-src, data-original, srcset) from HTML content
  const content = item["content:encoded"] || item.content || item.description || "";
  if (content) {
    const imgRegex = /<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      if (match[1]) candidates.push(match[1]);
    }

    const srcsetRegex = /<img[^>]+srcset=["']([^"'\s]+)/gi;
    while ((match = srcsetRegex.exec(content)) !== null) {
      if (match[1]) candidates.push(match[1]);
    }
  }

  // Filter candidates
  for (let url of candidates) {
    if (!url || typeof url !== "string") continue;
    url = url.trim();

    // Reject tracking pixels, icons, logos, and Google News placeholders
    const isBadUrl =
      url.includes("1x1") ||
      url.includes("tracking") ||
      url.includes("pixel") ||
      url.includes("feedburner") ||
      url.includes("googleusercontent.com") ||
      url.includes("favicon") ||
      url.includes("news.google.com") ||
      url.startsWith("data:image/");

    if (!isBadUrl) {
      return url;
    }
  }

  return null;
}

export async function fetchAndParseRSS(feedUrl: string): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    
    const articles: ParsedArticle[] = feed.items.map((item: Record<string, any>) => {
      // Prioritize full content over description
      const rawContent = item["content:encoded"] || item.content || item.description || "";
      const cleanedContent = cleanHtml(rawContent);
      const excerpt = extractExcerpt(cleanedContent);
      
      const author = item.creator || item["dc:creator"] || item.author || null;
      const imageUrl = extractImageUrl(item);
      const tags = Array.isArray(item.categories) ? item.categories.filter((c: unknown) => typeof c === 'string') as string[] : [];
      
      // Ensure we have a valid Date
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

      return {
        title: decodeHtmlEntities(item.title || "Untitled Article"),
        originalUrl: item.link || item.guid || "",
        excerpt: decodeHtmlEntities(excerpt),
        content: cleanedContent,
        imageUrl,
        author,
        publishedAt: isNaN(pubDate.getTime()) ? new Date() : pubDate,
        tags,
      };
    });

    // Filter out articles with no link
    return articles.filter((a) => a.originalUrl !== "");
  } catch (error) {
    console.error(`Error parsing RSS feed at ${feedUrl}:`, error);
    throw error;
  }
}
