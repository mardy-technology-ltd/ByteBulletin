import { ArticleRepository } from "@/repositories/article.repository";
import { ArticleCard } from "@/components/ui/cards/article-card";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

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
  
  // Use repository to fetch real data
  const articles = await ArticleRepository.getByCategory(slug);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8">
      <div className="border-b pb-6 mb-8">
        <h1 className="font-heading text-4xl font-bold tracking-tight capitalize">
          {slug.replace("-", " ")} News
        </h1>
        <p className="text-muted-foreground mt-2">
          The latest and most important stories in {slug.replace("-", " ")}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.length > 0 ? (
          articles.map(article => (
            <ArticleCard 
              key={article.id}
              id={article.id}
              title={article.title}
              slug={article.slug}
              excerpt={article.excerpt}
              sourceName={article.source.name}
              publishedAt={article.publishedAt}
              isAiSummarized={!!article.aiSummary}
              imageUrl={article.imageUrl}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center border rounded-xl bg-muted/20">
            <h3 className="text-lg font-semibold">No articles found</h3>
            <p className="text-muted-foreground">We couldn't find any recent articles in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
