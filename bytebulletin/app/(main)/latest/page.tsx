import { Metadata } from "next";
import { ArticleRepository } from "@/repositories/article.repository";
import { InfiniteArticleFeed } from "@/components/common/infinite-article-feed";
import { TrendingWidget } from "@/components/common/trending-widget";
import { getArticleImage } from "@/lib/utils/image";
import { Flame, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Latest News & Tech Stories | ByteBulletin",
  description: "Browse the most recent, real-time AI-summarized tech, business, and science news from global Tier-1 publishers.",
};

export default async function LatestNewsPage() {
  const result = await ArticleRepository.getPaginatedLatest(1, 10);

  const formattedArticles = result.articles.map((article: any) => ({
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

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Page Header */}
      <div className="space-y-3 border-b border-border/40 pb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-extrabold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-Time Feed</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Latest News & Stories
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Stay updated with real-time AI-synthesized news, high-impact enterprise developments, and technology reports.
        </p>
      </div>

      {/* Grid Layout: Main Feed & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-6">
          <InfiniteArticleFeed
            initialArticles={formattedArticles}
            initialHasMore={result.hasMore}
          />
        </div>

        {/* Sidebar Trending Column */}
        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          <TrendingWidget />
        </aside>
      </div>
    </div>
  );
}
