"use server";

import { ArticleRepository } from "@/repositories/article.repository";
import { getArticleImage } from "@/lib/utils/image";
import { prisma } from "@/lib/db/prisma";

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
    const result = await ArticleRepository.getPaginatedLatest(page, limit, excludeId, skipCount);

    const formattedArticles: FeedArticleItem[] = result.articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      imageUrl: getArticleImage(article.imageUrl, article.category?.slug, article.id),
      sourceName: article.source.name,
      categoryName: article.category?.name || "General",
      publishedAt: article.publishedAt.toISOString(),
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
    const result = await ArticleRepository.getPaginatedByCategory(categorySlug, page, limit, excludeId, skipCount);

    const formattedArticles: FeedArticleItem[] = result.articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      imageUrl: getArticleImage(article.imageUrl, article.category?.slug, article.id),
      sourceName: article.source.name,
      categoryName: article.category?.name || "General",
      publishedAt: article.publishedAt.toISOString(),
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
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query.trim(), mode: "insensitive" } },
          { excerpt: { contains: query.trim(), mode: "insensitive" } },
        ],
      },
      take: 6,
      orderBy: { publishedAt: "desc" },
      include: { source: true, category: true, aiSummary: true },
    });

    return articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      imageUrl: getArticleImage(article.imageUrl, article.category?.slug, article.id),
      sourceName: article.source.name,
      categoryName: article.category?.name || "General",
      publishedAt: article.publishedAt.toISOString(),
      isAiSummarized: !!article.aiSummary,
    }));
  } catch (error) {
    console.error("[searchArticlesAction Error]:", error);
    return [];
  }
}
