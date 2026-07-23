"use client";

import { useState } from "react";
import { ArticleListItem } from "@/components/ui/cards/article-list-item";
import { fetchMoreArticlesAction, FeedArticleItem } from "@/actions/article.actions";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ChevronDown } from "lucide-react";

interface InfiniteArticleFeedProps {
  initialArticles: FeedArticleItem[];
  initialHasMore: boolean;
  excludeHeroId?: string;
}

export function InfiniteArticleFeed({ initialArticles, initialHasMore, excludeHeroId }: InfiniteArticleFeedProps) {
  const [articles, setArticles] = useState<FeedArticleItem[]>(initialArticles);
  const [page, setPage] = useState(2); // Page 1 was loaded on server
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const res = await fetchMoreArticlesAction(page, 8, excludeHeroId);
      if (res.articles.length > 0) {
        setArticles((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const uniqueNew = res.articles.filter((a) => !existingIds.has(a.id));
          const combined = [...prev, ...uniqueNew];
          return combined.sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
        });
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
  };

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

      {/* Manual Load More Button & Footer Access */}
      <div className="py-10 flex items-center justify-center">
        {hasMore && (
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-8 py-3 h-12 rounded-full bg-slate-900 dark:bg-slate-800 hover:bg-violet-600 dark:hover:bg-violet-600 text-white font-bold text-sm border border-violet-500/30 shadow-lg shadow-violet-950/20 cursor-pointer transition-all active:scale-95 group"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Loading more stories...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Load More Stories</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </span>
            )}
          </Button>
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
