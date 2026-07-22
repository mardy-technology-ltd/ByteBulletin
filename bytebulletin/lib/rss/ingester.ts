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

    // Limit to latest 8 articles per feed per cycle to ensure fast execution
    const itemsToProcess = parsedArticles.slice(0, 8);

    // 3. Upsert Articles
    for (const parsed of itemsToProcess) {
      const baseSlug = generateSlug(parsed.title);
      const urlHash = Buffer.from(parsed.originalUrl).toString("base64").substring(0, 6).toLowerCase().replace(/[^a-z0-9]/g, 'x');
      const uniqueSlug = `${baseSlug}-${urlHash}`;

      const wordCount = parsed.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      try {
        const article = await prisma.article.upsert({
          where: { originalUrl: parsed.originalUrl },
          update: {
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
