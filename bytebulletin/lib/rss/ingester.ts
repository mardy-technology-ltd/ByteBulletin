import { prisma } from "@/lib/db/prisma";
import { fetchAndParseRSS } from "./parser";
import { FetchStatus } from "@prisma/client";
import { upgradeImageUrl } from "@/lib/utils/image";
import { extractKeywords } from "@/lib/utils/string";
import crypto from "crypto";

async function resolveUrl(url: string): Promise<string> {
  if (!url.includes("news.google.com")) return url;
  
  // Strategy 1: Decode from base64url path parameter (Fastest)
  const match = url.match(/articles\/([a-zA-Z0-9-_]+)/);
  if (match) {
    try {
      const decoded = Buffer.from(match[1], 'base64').toString('utf8');
      const urlMatch = decoded.match(/https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+/);
      if (urlMatch) {
        return urlMatch[0];
      }
    } catch (e) {
      // Ignore decoding errors
    }
  }

  // Strategy 2: Fetch the intermediate page and extract from data-n-a-id or meta refresh
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const metaRefreshMatch = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i);
      if (metaRefreshMatch && metaRefreshMatch[1]) {
         return metaRefreshMatch[1];
      }
      
      const aHrefMatch = html.match(/<a[^>]+href=["'](https?:\/\/[^"']+)["']/i);
      if (aHrefMatch && aHrefMatch[1]) {
         return aHrefMatch[1];
      }
    }
    return res.url; 
  } catch (err) {
    return url;
  }
}

/**
 * Generates a URL-safe slug from a string.
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens
}

export async function ingestRssFeed(sourceId: string) {
  const startTime = Date.now();
  let articlesFound = 0;
  let articlesCreated = 0;
  let errorMsg = null;
  let status: FetchStatus = FetchStatus.SUCCESS;

  try {
    // 1. Fetch the Source from DB
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
    });

    if (!source || !source.isActive) {
      throw new Error(`Source not found or is inactive (id: ${sourceId})`);
    }

    // 2. Fetch and Parse XML
    const parsedArticles = await fetchAndParseRSS(source.feedUrl);
    articlesFound = parsedArticles.length;

    // Limit to latest 8 articles per feed per cycle to ensure fast execution
    const itemsToProcess = parsedArticles.slice(0, 8);

    // 3. Upsert Articles
    for (const parsed of itemsToProcess) {
      const baseSlug = generateSlug(parsed.title);
      const urlHash = crypto.createHash('md5').update(parsed.originalUrl).digest('hex').substring(0, 6);
      const uniqueSlug = `${baseSlug}-${urlHash}`;

      const wordCount = parsed.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      let finalImageUrl = parsed.imageUrl;
      if (!finalImageUrl) {
        try {
          // Attempt to scrape og:image from the actual article URL
          const resolvedUrl = await resolveUrl(parsed.originalUrl);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const htmlRes = await fetch(resolvedUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          clearTimeout(timeoutId);

          if (htmlRes.ok) {
            const html = await htmlRes.text();
            const ogMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) || 
                            html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
            if (ogMatch && ogMatch[1]) {
              const matchedUrl = ogMatch[1];
              if (!matchedUrl.includes('googleusercontent.com') && !matchedUrl.includes('news.google.com')) {
                finalImageUrl = matchedUrl;
              }
            }
          }
        } catch (scrapeErr) {
          console.warn(`[Ingester] Failed to scrape og:image for ${parsed.originalUrl}`);
        }
      }

      // Upgrade URL to high-resolution if it matches known patterns
      finalImageUrl = upgradeImageUrl(finalImageUrl);
      
      // If still no image, use a unique placeholder fallback to avoid identical cat images
      if (!finalImageUrl) {
        finalImageUrl = `https://picsum.photos/seed/${urlHash}/800/600`;
      }

      try {
        const article = await prisma.article.upsert({
          where: { originalUrl: parsed.originalUrl },
          update: {
            title: parsed.title,
            excerpt: parsed.excerpt,
            content: parsed.content,
            imageUrl: finalImageUrl,
          },
          create: {
            title: parsed.title,
            slug: uniqueSlug,
            excerpt: parsed.excerpt,
            content: parsed.content,
            originalUrl: parsed.originalUrl,
            imageUrl: finalImageUrl,
            author: parsed.author,
            publishedAt: parsed.publishedAt,
            sourceId: source.id,
            categoryId: source.categoryId,
            readingTime,
            tags: {
              connectOrCreate: parsed.tags.slice(0, 3).map((tag: any) => ({
                where: { name: tag },
                create: { name: tag, slug: generateSlug(tag) },
              })),
            },
          },
        });

        const ageInMs = Date.now() - article.createdAt.getTime();
        if (ageInMs < 5000) {
          articlesCreated++;
        }
      } catch (upsertError) {
        console.error(`Failed to upsert article: ${parsed.originalUrl}`, upsertError);
        status = FetchStatus.PARTIAL;
      }
    }

    // 4. Update Source Last Fetched At
    await prisma.source.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date() },
    });

  } catch (error: any) {
    status = FetchStatus.FAILED;
    errorMsg = error.message || String(error);
  }

  const duration = Date.now() - startTime;

  // 5. Log the Fetch Results
  await prisma.rssFetchLog.create({
    data: {
      sourceId,
      status,
      articlesFound,
      articlesCreated,
      error: errorMsg,
      duration,
    },
  });

  return {
    status,
    articlesFound,
    articlesCreated,
    duration,
  };
}

/**
 * Convenience function to process active sources due for a fetch.
 * Prioritizes newly added sources (lastFetchedAt is null) then oldest fetched.
 */
export async function ingestDueSources() {
  // 1. Pick newly added sources that have NEVER been fetched yet (lastFetchedAt: null)
  const unfetchedSources = await prisma.source.findMany({
    where: { isActive: true, lastFetchedAt: null },
    take: 4,
  });

  // 2. Fill remaining slots up to 4 sources with oldest fetched sources
  let sources = [...unfetchedSources];
  if (sources.length < 4) {
    const fetchedSources = await prisma.source.findMany({
      where: {
        isActive: true,
        id: { notIn: unfetchedSources.map((s) => s.id) },
      },
      orderBy: { lastFetchedAt: "asc" },
      take: 4 - sources.length,
    });
    sources = [...sources, ...fetchedSources];
  }

  const results = await Promise.all(
    sources.map(async (source) => {
      console.log(`Ingesting source: ${source.name} (${source.feedUrl})`);
      const result = await ingestRssFeed(source.id);
      return { source: source.name, ...result };
    })
  );

  return results;
}
