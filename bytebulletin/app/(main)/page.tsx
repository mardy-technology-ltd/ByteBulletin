import Link from "next/link";
import { LiveTicker } from "@/components/common/live-ticker";
import { FeaturedHeroCard } from "@/components/ui/cards/featured-hero-card";
import { ArticleListItem } from "@/components/ui/cards/article-list-item";
import { ListCard } from "@/components/ui/cards/list-card";
import { ArticleRepository } from "@/repositories/article.repository";
import { getArticleImage } from "@/lib/utils/image";

// ISR: Revalidate the homepage every 60 seconds
export const revalidate = 60;

export default async function Home() {
  // Fetch all required data in parallel for performance
  const [featuredHero, latestArticles, trendingArticles, breakingNews] = await Promise.all([
    ArticleRepository.getFeaturedHero(),
    ArticleRepository.getLatest(6),
    ArticleRepository.getTrending(5),
    ArticleRepository.getBreakingNews(3),
  ]);

  // Format breaking news for the ticker
  const tickerItems = breakingNews.map((item: any) => ({
    id: item.id,
    title: item.seo?.title || item.title,
    slug: item.slug
  }));

  // Ensure we don't display the featured hero article again in the latest list
  const filteredLatest = featuredHero 
    ? latestArticles.filter(a => a.id !== featuredHero.id) 
    : latestArticles;

  return (
    <div className="flex flex-col min-h-screen">
      {tickerItems.length > 0 && <LiveTicker items={tickerItems} />}
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
          
          {/* Hero Section */}
          {featuredHero && (
            <section>
              <FeaturedHeroCard 
                id={featuredHero.id}
                title={featuredHero.seo?.title || featuredHero.title}
                slug={featuredHero.slug}
                excerpt={featuredHero.excerpt || ""}
                categoryName={featuredHero.category?.name || "General"}
                publishedAt={featuredHero.publishedAt}
                imageUrl={getArticleImage(featuredHero.imageUrl, featuredHero.category?.slug, featuredHero.id)}
              />
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Feed */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h2 className="font-heading text-2xl font-bold tracking-tight">Latest Stories</h2>
                <Link href="/latest" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              
              <div className="flex flex-col">
                {filteredLatest.length > 0 ? (
                  filteredLatest.map((article: any) => (
                    <ArticleListItem 
                      key={article.id}
                      id={article.id}
                      title={article.title}
                      slug={article.slug}
                      excerpt={article.excerpt}
                      sourceName={article.source.name}
                      publishedAt={article.publishedAt}
                      isAiSummarized={!!article.aiSummary}
                      imageUrl={getArticleImage(article.imageUrl, article.category?.slug, article.id)}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm py-8 text-center">No articles available.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
                <h3 className="font-heading text-xl font-bold mb-6 flex items-center tracking-tight">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary mr-3 animate-pulse" />
                  Trending Now
                </h3>
                <div className="flex flex-col space-y-1">
                  {trendingArticles.length > 0 ? (
                    trendingArticles.map((article, index) => (
                      <ListCard 
                        key={article.id}
                        id={article.id}
                        title={article.title}
                        slug={article.slug}
                        sourceName={article.source.name}
                        publishedAt={article.publishedAt}
                        index={index}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No trending articles.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
