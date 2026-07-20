import { ArticleRepository } from "@/repositories/article.repository";
import { ArticleCard } from "@/components/ui/cards/article-card";
import { Search as SearchIcon } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search News",
  description: "Search for the latest AI-curated news.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";
  
  // Use repository to fetch real search data if a query exists
  const articles = query ? await ArticleRepository.search(query) : [];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto w-full mb-12">
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-8 text-center">Search</h1>
        
        {/* Native HTML Form submits via GET request to ?q=... */}
        <form action="/search" method="GET" className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            name="q"
            defaultValue={query}
            placeholder="What are you looking for?" 
            className="w-full text-2xl font-heading bg-transparent border-b-2 border-border focus:border-primary outline-none py-4 pl-14 transition-colors placeholder:text-muted-foreground/50"
            autoFocus
          />
        </form>
      </div>

      {query && (
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-medium">
              Results for <span className="font-bold">"{query}"</span>
            </h2>
            <span className="text-muted-foreground text-sm">{articles.length} found</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="col-span-full py-16 text-center border rounded-xl bg-muted/20">
                <h3 className="text-lg font-semibold">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms or keywords.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
