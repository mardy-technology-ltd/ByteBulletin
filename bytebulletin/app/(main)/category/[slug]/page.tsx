import { ArticleRepository } from "@/repositories/article.repository";
import { FeaturedArticle } from "@/components/ui/cards/featured-article";
import { ArticleListItem } from "@/components/ui/cards/article-list-item";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticleImage } from "@/lib/utils/image";
import { InfiniteCategoryFeed } from "@/components/common/infinite-category-feed";
import { FeedArticleItem } from "@/actions/article.actions";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// ISR: Revalidate category page every 60 seconds
export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${categoryName} News`,
    description: `Latest news and updates in ${categoryName}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  // Use repository to fetch initial paginated articles for this category
  const paginatedResult = await ArticleRepository.getPaginatedByCategory(slug, 1, 7);
  const articles = paginatedResult.articles;

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

  // Format initial SSR items for client feed
  const initialFormattedItems: FeedArticleItem[] = remainingArticles.map((article: any) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    imageUrl: getArticleImage(article.imageUrl, slug, article.id),
    sourceName: article.source.name,
    publishedAt: article.publishedAt.toISOString(),
    isAiSummarized: !!article.aiSummary,
  }));

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 md:px-8">
      <div className="border-b border-border/50 pb-6 mb-8">
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight capitalize">
          {slug.replace("-", " ")} News
        </h1>
        <p className="text-lg text-muted-foreground mt-3">
          The latest and most important stories in {slug.replace("-", " ")}.
        </p>
      </div>

      {featuredArticle && (
        <FeaturedArticle 
          id={featuredArticle.id}
          title={featuredArticle.title}
          slug={featuredArticle.slug}
          excerpt={featuredArticle.excerpt}
          sourceName={featuredArticle.source.name}
          publishedAt={featuredArticle.publishedAt}
          isAiSummarized={!!featuredArticle.aiSummary}
          imageUrl={getArticleImage(featuredHeroImageUrl(featuredArticle), slug, featuredArticle.id)}
        />
      )}

      <div className="mt-6">
        {initialFormattedItems.length > 0 ? (
          <>
            <InfiniteCategoryFeed 
              categorySlug={slug}
              initialArticles={initialFormattedItems}
              initialHasMore={paginatedResult.hasMore}
              excludeHeroId={featuredArticle?.id}
            />

            {/* Fallback for non-JS web crawlers */}
            <noscript>
              <div className="flex flex-col">
                {initialFormattedItems.map((article) => (
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
            </noscript>
          </>
        ) : (
          !featuredArticle && (
            <div className="py-16 text-center border border-border/50 rounded-2xl bg-muted/10">
              <h3 className="text-xl font-bold tracking-tight mb-2">No articles found</h3>
              <p className="text-muted-foreground">We couldn&apos;t find any recent articles in this category.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function featuredHeroImageUrl(article: any) {
  return article.imageUrl;
}

