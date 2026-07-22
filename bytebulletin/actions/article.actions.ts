"use server";

import { ArticleRepository } from "@/repositories/article.repository";
import { getArticleImage } from "@/lib/utils/image";

export interface FeedArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string;
  sourceName: string;
  publishedAt: string;
  isAiSummarized: boolean;
}

export async function fetchMoreArticlesAction(
  page: number,
  limit = 6,
  excludeId?: string
): Promise<{ articles: FeedArticleItem[]; hasMore: boolean; nextPage: number | null }> {
  try {
    const result = await ArticleRepository.getPaginatedLatest(page, limit, excludeId);

    const formattedArticles: FeedArticleItem[] = result.articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      imageUrl: getArticleImage(article.imageUrl, article.category?.slug, article.id),
      sourceName: article.source.name,
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
  excludeId?: string
): Promise<{ articles: FeedArticleItem[]; hasMore: boolean; nextPage: number | null }> {
  try {
    const result = await ArticleRepository.getPaginatedByCategory(categorySlug, page, limit, excludeId);

    const formattedArticles: FeedArticleItem[] = result.articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      imageUrl: getArticleImage(article.imageUrl, categorySlug, article.id),
      sourceName: article.source.name,
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
