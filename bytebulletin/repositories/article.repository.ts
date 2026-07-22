import { prisma } from "@/lib/db/prisma";

export class ArticleRepository {
  /**
   * Fetches the single most prominent article to feature on the homepage.
   */
  static async getFeaturedHero() {
    return prisma.article.findFirst({
      where: { 
        status: "PUBLISHED",
        imageUrl: { not: null }, // Hero must have an image
      },
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        seo: { select: { title: true } }
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
  static async getPaginatedLatest(page = 1, limit = 6, excludeId?: string) {
    const skip = (page - 1) * limit;
    
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
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
        aiSummary: { isNot: null }, // Must be processed by AI
      },
      take: limit,
      orderBy: { publishedAt: "desc" }, // In a real app, this would order by page views or CTR
      include: {
        source: { select: { name: true } },
      },
    });
  }

  /**
   * Fetches breaking news for the live ticker.
   */
  static async getBreakingNews(limit = 3) {
    return prisma.article.findMany({
      where: { status: "PUBLISHED" },
      take: limit,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        seo: { select: { title: true } }
      }
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
  static async getPaginatedByCategory(slug: string, page = 1, limit = 10, excludeId?: string) {
    const skip = (page - 1) * limit;
    
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
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
   * Fetches a single article by its slug.
   */
  static async getBySlug(slug: string) {
    return prisma.article.findUnique({
      where: { slug },
      include: {
        source: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        aiSummary: true,
        seo: true,
      },
    });
  }

  /**
   * Searches articles by a query string.
   */
  static async search(query: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    
    return prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          {
            aiSummary: {
              summary: { contains: query, mode: "insensitive" }
            }
          }
        ]
      },
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        source: { select: { name: true } },
        aiSummary: { select: { id: true } },
      },
    });
  }
}
