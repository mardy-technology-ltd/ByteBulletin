"use server";

import { ArticleRepository } from "@/repositories/article.repository";
import { getArticleImage } from "@/lib/utils/image";
import { prisma } from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";

export interface FeedArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string;
  sourceName: string;
  categoryName?: string;
  publishedAt: string;
  isAiSummarized: boolean;
}

export async function fetchMoreArticlesAction(
  page: number,
  limit = 6,
  excludeId?: string,
  skipCount?: number
): Promise<{ articles: FeedArticleItem[]; hasMore: boolean; nextPage: number | null }> {
  try {
    const getCachedArticles = unstable_cache(
      async (p, l, eId, sCount) => ArticleRepository.getPaginatedLatest(p, l, eId, sCount),
      [`feed-latest-${page}-${limit}-${excludeId || 'none'}-${skipCount || 0}`],
      { revalidate: 60 } // Cache feed for 60 seconds
    );

    const result = await getCachedArticles(page, limit, excludeId, skipCount);

    const formattedArticles: FeedArticleItem[] = result.articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      imageUrl: getArticleImage(article.imageUrl, article.category?.slug, article.id),
      sourceName: article.source?.name || "ByteBulletin",
      categoryName: article.category?.name || "General",
      publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
      isAiSummarized: !!article.aiSummary,
    }));

    return {
      articles: formattedArticles,
      hasMore: result.hasMore,
      nextPage: result.nextPage,
    };
  } catch (error) {
    console.error("[fetchMoreArticlesAction Error]:", error);
    return {
      articles: [],
      hasMore: false,
      nextPage: null,
    };
  }
}

export async function fetchMoreCategoryArticlesAction(
  categorySlug: string,
  page: number,
  limit = 10,
  excludeId?: string,
  skipCount?: number
): Promise<{ articles: FeedArticleItem[]; hasMore: boolean; nextPage: number | null }> {
  try {
    const getCachedCategoryArticles = unstable_cache(
      async (slug, p, l, eId, sCount) => ArticleRepository.getPaginatedByCategory(slug, p, l, eId, sCount),
      [`feed-category-${categorySlug}-${page}-${limit}-${excludeId || 'none'}-${skipCount || 0}`],
      { revalidate: 60 }
    );

    const result = await getCachedCategoryArticles(categorySlug, page, limit, excludeId, skipCount);

    const formattedArticles: FeedArticleItem[] = result.articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      imageUrl: getArticleImage(article.imageUrl, article.category?.slug, article.id),
      sourceName: article.source?.name || "ByteBulletin",
      categoryName: article.category?.name || "General",
      publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
      isAiSummarized: !!article.aiSummary,
    }));

    return {
      articles: formattedArticles,
      hasMore: result.hasMore,
      nextPage: result.nextPage,
    };
  } catch (error) {
    console.error("[fetchMoreCategoryArticlesAction Error]:", error);
    return {
      articles: [],
      hasMore: false,
      nextPage: null,
    };
  }
}

/**
 * Real-time instant search action for Live Search Modal
 */
export async function searchArticlesAction(query: string): Promise<FeedArticleItem[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const getCachedArticles = unstable_cache(
      async (q: string) => {
        return prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 6,
          orderBy: { publishedAt: "desc" },
          include: { source: true, category: true, aiSummary: true },
        });
      },
      [`search-${query.trim().toLowerCase()}`],
      { revalidate: 300 } // Cache search results for 5 minutes
    );

    const articles = await getCachedArticles(query.trim());

    return articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      imageUrl: getArticleImage(article.imageUrl, article.category?.slug, article.id),
      sourceName: article.source.name,
      categoryName: article.category?.name || "General",
      publishedAt: new Date(article.publishedAt).toISOString(),
      isAiSummarized: !!article.aiSummary,
    }));
  } catch (error) {
    console.error("[searchArticlesAction Error]:", error);
    return [];
  }
}
