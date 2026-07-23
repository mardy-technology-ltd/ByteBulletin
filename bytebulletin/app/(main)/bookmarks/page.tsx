import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { BookmarkRepository } from "@/repositories/bookmark.repository";
import { ArticleCard } from "@/components/ui/cards/article-card";
import { EmptyState } from "@/components/common/empty-state";
import { Bookmark } from "lucide-react";

export const metadata = {
  title: "My Bookmarks - ByteBulletin",
  description: "View your saved articles on ByteBulletin.",
};

export default async function BookmarksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/bookmarks");
  }

  const bookmarkedArticles = await BookmarkRepository.getUserBookmarks(session.user.id);

  return (
    <div className="max-w-[1536px] mx-auto py-10 px-4 md:px-8 min-h-screen">
      <div className="border-b pb-6 mb-8 flex items-center">
        <Bookmark className="w-8 h-8 mr-3 text-primary" />
        <h1 className="font-heading text-4xl font-bold tracking-tight">My Bookmarks</h1>
      </div>

      {bookmarkedArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedArticles.map((article: any) => (
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
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-xl bg-muted/20">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-heading font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Articles you save will appear here for you to read later.
          </p>
          <a href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Browse latest news
          </a>
        </div>
      )}
    </div>
  );
}
