import { prisma } from "@/lib/db/prisma";
import { fetchAndParseRSS } from "./parser";
import { FetchStatus } from "@prisma/client";

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

    // 3. Upsert Articles
    for (const parsed of parsedArticles) {
      // Create a unique slug (using title + a small hash if needed, or just title)
      const baseSlug = generateSlug(parsed.title);
      // To ensure uniqueness and avoid conflicts on same title, append a short hash of the URL
      const urlHash = Buffer.from(parsed.originalUrl).toString("base64").substring(0, 6).toLowerCase().replace(/[^a-z0-9]/g, 'x');
      const uniqueSlug = `${baseSlug}-${urlHash}`;

      // Calculate reading time (avg 200 words per minute)
      const wordCount = parsed.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      try {
        const article = await prisma.article.upsert({
          where: { originalUrl: parsed.originalUrl },
          update: {
            // Only update non-destructive fields if it exists
            title: parsed.title,
            excerpt: parsed.excerpt,
            content: parsed.content,
            imageUrl: parsed.imageUrl,
          },
          create: {
            title: parsed.title,
            slug: uniqueSlug,
            excerpt: parsed.excerpt,
            content: parsed.content,
            originalUrl: parsed.originalUrl,
            imageUrl: parsed.imageUrl,
            author: parsed.author,
            publishedAt: parsed.publishedAt,
            sourceId: source.id,
            categoryId: source.categoryId,
            readingTime,
            // Connect or create tags
            tags: {
              connectOrCreate: parsed.tags.slice(0, 5).map((tag: any) => ({
                where: { name: tag },
                create: { name: tag, slug: generateSlug(tag) },
              })),
            },
          },
        });

        // If createdAt is basically now, it was just inserted
        // Note: Prisma doesn't return a boolean for upsert, so we check timestamps.
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
 * Convenience function to process all active sources that are due for a fetch.
 */
export async function ingestDueSources() {
  const sources = await prisma.source.findMany({
    where: { isActive: true },
  });

  const now = new Date();
  const results = [];

  for (const source of sources) {
    const lastFetched = source.lastFetchedAt?.getTime() || 0;
    const intervalMs = source.fetchInterval * 60 * 1000;

    // Check if it's due
    if (now.getTime() - lastFetched >= intervalMs) {
      console.log(`Ingesting source: ${source.name} (${source.feedUrl})`);
      const result = await ingestRssFeed(source.id);
      results.push({ source: source.name, ...result });
    }
  }

  return results;
}
