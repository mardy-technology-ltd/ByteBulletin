"use client";

import { useEffect, useState } from "react";
import { fetchMoreCategoryArticlesAction, fetchMoreArticlesAction, FeedArticleItem } from "@/actions/article.actions";
import { ArticleCard } from "@/components/ui/cards/article-card";
import { Loader2 } from "lucide-react";

interface RelatedArticlesProps {
  currentArticleId: string;
  categorySlug?: string;
}

export function RelatedArticles({ currentArticleId, categorySlug }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<FeedArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRelated() {
      setIsLoading(true);
      try {
        let fetchedArticles: FeedArticleItem[] = [];

        // 1. Fetch from the same category
        if (categorySlug) {
          const res = await fetchMoreCategoryArticlesAction(categorySlug, 1, 3, currentArticleId);
          fetchedArticles = res.articles || [];
        }

        // 2. Fallback to latest if not enough articles in the category
        if (fetchedArticles.length < 3) {
          // We pass a dummy excludeId if we need to exclude multiple, but the action currently only supports one string.
          // Since we want 3 total, we fetch the difference.
          const fallbackLimit = 3 - fetchedArticles.length;
          const fallbackRes = await fetchMoreArticlesAction(1, fallbackLimit, currentArticleId);
          
          // Filter out any articles we might have already fetched (just in case)
          const existingIds = new Set(fetchedArticles.map(a => a.id));
          const newArticles = fallbackRes.articles.filter(a => !existingIds.has(a.id));
          
          fetchedArticles = [...fetchedArticles, ...newArticles].slice(0, 3);
        }

        if (isMounted) {
          setArticles(fetchedArticles);
        }
      } catch (error) {
        console.error("Error loading related articles:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRelated();

    return () => {
      isMounted = false;
    };
  }, [currentArticleId, categorySlug]);

  if (isLoading) {
    return (
      <div className="py-10 border-t border-border/60">
        <h3 className="text-xl font-bold font-heading mb-6">Related Articles</h3>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="py-10 border-t border-border/60 mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold font-heading tracking-tight">Read More</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            id={article.id}
            title={article.title}
            slug={article.slug}
            excerpt={article.excerpt}
            imageUrl={article.imageUrl}
            sourceName={article.sourceName}
            publishedAt={new Date(article.publishedAt)}
            isAiSummarized={article.isAiSummarized}
          />
        ))}
      </div>
    </section>
  );
}
