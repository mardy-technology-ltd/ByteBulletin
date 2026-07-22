import Link from "next/link";
import { SynchronizedHeroSection } from "@/components/common/synchronized-hero-section";
import { FeaturedHeroItem } from "@/components/ui/cards/featured-hero-slider";
import { ArticleListItem } from "@/components/ui/cards/article-list-item";
import { ListCard } from "@/components/ui/cards/list-card";
import { ArticleRepository } from "@/repositories/article.repository";
import { getArticleImage } from "@/lib/utils/image";
import { InfiniteArticleFeed } from "@/components/common/infinite-article-feed";
import { FeedArticleItem } from "@/actions/article.actions";

// ISR: Revalidate the homepage every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const featuredHeroes = await ArticleRepository.getFeaturedHeroes(5);
  const primaryHeroId = featuredHeroes[0]?.id;

  // Fetch all required data in parallel for performance
  const [latestResult, trendingArticles, breakingNews] = await Promise.all([
    ArticleRepository.getPaginatedLatest(1, 6, primaryHeroId),
    ArticleRepository.getTrending(5),
    ArticleRepository.getBreakingNews(6),
  ]);

  // Format breaking news for the ticker directly from featured stories
  const tickerItems = featuredHeroes.map((item: any) => ({
    id: item.id,
    title: item.seo?.title || item.title,
    slug: item.slug,
    categoryName: item.category?.name || "News",
  }));

  // Format featured hero items for slider
  const formattedFeaturedHeroes: FeaturedHeroItem[] = featuredHeroes.map((hero: any) => ({
    id: hero.id,
    title: hero.seo?.title || hero.title,
    slug: hero.slug,
    excerpt: hero.excerpt || "",
    categoryName: hero.category?.name || "General",
    publishedAt: hero.publishedAt,
    imageUrl: getArticleImage(hero.imageUrl, hero.category?.slug, hero.id),
  }));

  // Format initial SSR batch of articles for the feed
  const initialFormattedArticles: FeedArticleItem[] = latestResult.articles.map((article: any) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    imageUrl: getArticleImage(article.imageUrl, article.category?.slug, article.id),
    sourceName: article.source.name,
    publishedAt: article.publishedAt.toISOString(),
    isAiSummarized: !!article.aiSummary,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Synchronized Hero Section (Breaking News Ticker + Featured Slider Master Controller) */}
      <SynchronizedHeroSection
        tickerItems={tickerItems}
        heroItems={formattedFeaturedHeroes}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Feed */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h2 className="font-heading text-2xl font-bold tracking-tight">Latest Stories</h2>
                <Link href="/latest" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              
              {initialFormattedArticles.length > 0 ? (
                <>
                  <InfiniteArticleFeed 
                    initialArticles={initialFormattedArticles}
                    initialHasMore={latestResult.hasMore}
                    excludeHeroId={primaryHeroId} 
                  />
                  
                  {/* Fallback for non-JS web crawlers */}
                  <noscript>
                    <div className="flex flex-col">
                      {initialFormattedArticles.map((article) => (
                        <ArticleListItem 
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
                  </noscript>
                </>
              ) : (
                <p className="text-muted-foreground py-8 text-center">No articles available.</p>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Trending Section */}
              <div className="rounded-2xl border border-border/40 bg-card/40 p-6 space-y-4 shadow-sm backdrop-blur-xs">
                <h3 className="font-heading text-lg font-bold tracking-tight border-b border-border/40 pb-3 flex items-center justify-between">
                  <span>Trending Topics</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <div className="space-y-1 divide-y divide-border/30">
                  {trendingArticles.map((article: any, index: number) => (
                    <ListCard 
                      key={article.id}
                      id={article.id}
                      title={article.title}
                      slug={article.slug}
                      sourceName={article.source.name}
                      publishedAt={article.publishedAt}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
