"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { SingleArticleView, SingleArticleData } from "./single-article-view";
import { Loader2, ArrowDown, Sparkles } from "lucide-react";

interface InfiniteArticleFeedProps {
  initialArticle: SingleArticleData;
  isAuthenticated: boolean;
  initialIsBookmarked?: boolean;
  categorySlug?: string;
  maxAutoLoad?: number; // Max articles to auto-load before pausing for footer
}

export function InfiniteArticleFeed({
  initialArticle,
  isAuthenticated,
  initialIsBookmarked = false,
  categorySlug,
  maxAutoLoad = 2,
}: InfiniteArticleFeedProps) {
  const [articles, setArticles] = useState<SingleArticleData[]>([initialArticle]);
  const [autoLoadedCount, setAutoLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const activeSlugRef = useRef<string>(initialArticle.slug);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch next article function
  const fetchNextArticle = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const excludeIds = articles.map((a) => a.id).join(",");
      const currentSlug = articles[articles.length - 1].slug;

      const url = new URL("/api/articles/next", window.location.origin);
      url.searchParams.set("currentSlug", currentSlug);
      if (categorySlug) url.searchParams.set("categorySlug", categorySlug);
      if (excludeIds) url.searchParams.set("excludeIds", excludeIds);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.success && data.article) {
        setArticles((prev) => [...prev, data.article]);
        setAutoLoadedCount((count) => count + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load next article:", err);
    } finally {
      setIsLoading(false);
    }
  }, [articles, categorySlug, hasMore, isLoading]);

  // URL & Document Title Sync on Scroll using IntersectionObserver
  useEffect(() => {
    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const slug = target.getAttribute("data-slug");
          const title = target.getAttribute("data-title");

          if (slug && slug !== activeSlugRef.current) {
            activeSlugRef.current = slug;
            const newUrl = `/news/${slug}`;
            
            // Silently update browser URL without triggering Next.js router re-render
            window.history.replaceState(null, "", newUrl);

            if (title) {
              document.title = `${title} | ByteBulletin`;
            }
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "-20% 0px -40% 0px", // Trigger when article takes main view
      threshold: 0.1,
    });

    const articleElements = document.querySelectorAll("article[data-slug]");
    articleElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [articles]);

  // Trigger auto-load near bottom of page if within auto-load limit
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore || autoLoadedCount >= maxAutoLoad) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.offsetHeight - 800; // 800px before page end

      if (scrollPosition >= threshold) {
        fetchNextArticle();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [autoLoadedCount, maxAutoLoad, isLoading, hasMore, fetchNextArticle]);

  return (
    <div className="w-full">
      {articles.map((art, idx) => (
        <SingleArticleView
          key={art.id}
          article={art}
          isAuthenticated={isAuthenticated}
          initialIsBookmarked={idx === 0 ? initialIsBookmarked : false}
          isAutoLoaded={idx > 0}
        />
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading next story...</p>
        </div>
      )}

      {/* Manual "Load More Stories" Button after Batch Auto-Load limit (Protects Footer accessibility) */}
      {!isLoading && hasMore && autoLoadedCount >= maxAutoLoad && (
        <div className="max-w-3xl mx-auto py-12 px-4 text-center border-t border-border mt-12">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Enjoying the bulletin?</span>
          </div>
          <h3 className="text-xl font-bold mb-4">Keep reading the latest tech stories</h3>
          <button
            onClick={() => {
              setAutoLoadedCount(0); // Reset count to auto-load 2 more or load instantly
              fetchNextArticle();
            }}
            className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3.5 rounded-full shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Load More Stories</span>
            <ArrowDown className="w-4 h-4" />
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            Or scroll down to explore category links & footer
          </p>
        </div>
      )}

      {/* End of Stories Message */}
      {!hasMore && (
        <div className="max-w-3xl mx-auto py-12 px-4 text-center border-t border-border mt-12">
          <p className="text-sm font-medium text-muted-foreground">
            You&apos;ve reached the end of the latest stories for now!
          </p>
        </div>
      )}
    </div>
  );
}
