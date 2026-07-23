import { prisma } from "@/lib/db/prisma";

export class ArticleRepository {
  /**
   * Fetches the single most prominent article to feature on the homepage.
   */
  static async getFeaturedHero() {
    return prisma.article.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        imageUrl: { not: null }, // Hero must have an image
      },
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        seo: { select: { title: true } },
      },
    });
  }

  /**
   * Fetches multiple prominent articles to feature in the homepage carousel slider.
   */
  static async getFeaturedHeroes(limit = 5) {
    return prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        imageUrl: { not: null },
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        seo: { select: { title: true } },
      },
    });
  }

  /**
   * Fetches the latest published articles.
   */
  static async getLatest(limit = 6, excludeId?: string) {
    return prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
        category: { select: { slug: true } },
        aiSummary: { select: { id: true } },
      },
    });
  }

  /**
   * Fetches paginated latest articles for infinite scroll.
   */
  static async getPaginatedLatest(page = 1, limit = 6, excludeId?: string, skipCount?: number) {
    const skip = typeof skipCount === "number" ? skipCount : (page - 1) * limit;

    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      skip,
      take: limit + 1, // Fetch 1 extra to check if there are more
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
        category: { select: { slug: true } },
        aiSummary: { select: { id: true } },
      },
    });

    const hasMore = articles.length > limit;
    const items = hasMore ? articles.slice(0, limit) : articles;

    return {
      articles: items,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    };
  }

  /**
   * Fetches "Trending" articles (currently simulated by fetching articles with AI Summaries)
   */
  static async getTrending(limit = 5) {
    return prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        aiSummary: { isNot: null }, // Must be processed by AI
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
      },
    });
  }

  /**
   * Fetches breaking news for the live ticker.
   */
  static async getBreakingNews(limit = 6) {
    return prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: {
          select: { name: true, slug: true },
        },
        seo: { select: { title: true } },
      },
    });
  }

  /**
   * Fetches articles by category slug.
   */
  static async getByCategory(slug: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;

    return prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        category: { slug },
      },
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
        category: { select: { slug: true } },
        aiSummary: { select: { id: true } },
      },
    });
  }

  /**
   * Fetches paginated articles by category for infinite scroll.
   */
  static async getPaginatedByCategory(slug: string, page = 1, limit = 10, excludeId?: string, skipCount?: number) {
    const skip = typeof skipCount === "number" ? skipCount : (page - 1) * limit;

    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        category: { slug },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      skip,
      take: limit + 1, // Fetch 1 extra item to check if there are more pages
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
        category: { select: { slug: true } },
        aiSummary: { select: { id: true } },
      },
    });

    const hasMore = articles.length > limit;
    const items = hasMore ? articles.slice(0, limit) : articles;

    return {
      articles: items,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    };
  }

  /**
   * Searches published articles by query term.
   */
  static async search(query: string, limit = 20) {
    return prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
        category: { select: { slug: true } },
        aiSummary: { select: { id: true } },
      },
    });
  }

  /**
   * Fetches a single article by slug with detailed relations.
   */
  static async getBySlug(slug: string) {
    return prisma.article.findUnique({
      where: { slug },
      include: {
        source: true,
        category: true,
        tags: true,
        aiSummary: true,
        seo: true,
      },
    });
  }
}
