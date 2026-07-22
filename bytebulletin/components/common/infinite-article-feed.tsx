"use client";

import { useState, useEffect, useRef } from "react";
import { ArticleListItem } from "@/components/ui/cards/article-list-item";
import { fetchMoreArticlesAction, FeedArticleItem } from "@/actions/article.actions";
import { Loader2, CheckCircle2 } from "lucide-react";

interface InfiniteArticleFeedProps {
  initialArticles: FeedArticleItem[];
  excludeHeroId?: string;
}

export function InfiniteArticleFeed({ initialArticles, excludeHeroId }: InfiniteArticleFeedProps) {
  const [articles, setArticles] = useState<FeedArticleItem[]>(initialArticles);
  const [page, setPage] = useState(2); // Page 1 was loaded on server
  const [hasMore, setHasMore] = useState(initialArticles.length >= 5);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          try {
            const res = await fetchMoreArticlesAction(page, 6, excludeHeroId);
            if (res.articles.length > 0) {
              setArticles((prev) => [...prev, ...res.articles]);
              setHasMore(res.hasMore);
              if (res.nextPage) setPage(res.nextPage);
            } else {
              setHasMore(false);
            }
          } catch (error) {
            console.error("Failed to load more articles", error);
            setHasMore(false);
          } finally {
            setIsLoading(false);
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
  }, [page, hasMore, isLoading, excludeHeroId]);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col">
        {articles.map((article) => (
          <ArticleListItem
            key={article.id}
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
            <span>Loading more stories...</span>
          </div>
        )}

        {!hasMore && articles.length > 0 && (
          <div className="flex items-center space-x-2 text-muted-foreground text-xs py-4">
            <CheckCircle2 className="w-4 h-4 text-violet-500" />
            <span>You&apos;re all caught up with the latest stories.</span>
          </div>
        )}
      </div>
    </div>
  );
}
