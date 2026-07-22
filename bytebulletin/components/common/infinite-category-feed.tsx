"use client";

import { useState, useEffect, useRef } from "react";
import { ArticleListItem } from "@/components/ui/cards/article-list-item";
import { fetchMoreCategoryArticlesAction, FeedArticleItem } from "@/actions/article.actions";
import { Loader2, CheckCircle2 } from "lucide-react";

interface InfiniteCategoryFeedProps {
  categorySlug: string;
  initialArticles: FeedArticleItem[];
  initialHasMore: boolean;
  excludeHeroId?: string;
}

export function InfiniteCategoryFeed({
  categorySlug,
  initialArticles,
  initialHasMore,
  excludeHeroId,
}: InfiniteCategoryFeedProps) {
  const [articles, setArticles] = useState<FeedArticleItem[]>(initialArticles);
  const [page, setPage] = useState(2); // Page 1 was rendered on server
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !fetchingRef.current) {
          fetchingRef.current = true;
          setIsLoading(true);
          try {
            const res = await fetchMoreCategoryArticlesAction(categorySlug, page, 8, excludeHeroId);
            if (res.articles.length > 0) {
              setArticles((prev) => {
                const existingIds = new Set(prev.map((a) => a.id));
                const uniqueNew = res.articles.filter((a) => !existingIds.has(a.id));
                return [...prev, ...uniqueNew];
              });
              setHasMore(res.hasMore);
              if (res.nextPage) setPage(res.nextPage);
            } else {
              setHasMore(false);
            }
          } catch (error) {
            console.error("Failed to load more category articles", error);
            setHasMore(false);
          } finally {
            setIsLoading(false);
            fetchingRef.current = false;
          }
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [categorySlug, page, hasMore, excludeHeroId]);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col">
        {articles.map((article, index) => (
          <ArticleListItem
            key={`${article.id}-${index}`}
            id={article.id}
            title={article.title}
            slug={article.slug}
            excerpt={article.excerpt}
            sourceName={article.sourceName}
            publishedAt={new Date(article.publishedAt)}
            isAiSummarized={article.isAiSummarized}
            imageUrl={article.imageUrl}
          />
        ))}
      </div>

      {/* Sentinel & Loading indicator */}
      <div ref={sentinelRef} className="py-8 flex items-center justify-center">
        {isLoading && (
          <div className="flex items-center space-x-2 text-primary font-medium text-sm animate-pulse bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading more stories in {categorySlug.replace("-", " ")}...</span>
          </div>
        )}

        {!hasMore && articles.length > 0 && (
          <div className="flex items-center space-x-2 text-muted-foreground text-xs py-4">
            <CheckCircle2 className="w-4 h-4 text-violet-500" />
            <span>You&apos;re all caught up with {categorySlug.replace("-", " ")} stories.</span>
          </div>
        )}
      </div>
    </div>
  );
}
