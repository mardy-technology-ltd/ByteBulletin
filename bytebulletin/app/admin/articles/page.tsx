import { prisma } from "@/lib/db/prisma";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ArticleDeleteButton } from "./article-delete-button";

export const metadata = {
  title: "Articles Management - Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  let articles: any[] = [];
  try {
    articles = await prisma.article.findMany({
      include: {
        source: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 100, // Limit to recent 100 for performance
    });
  } catch (err) {
    console.error("AdminArticlesPage Error:", err);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Manage Articles</h1>
        <p className="text-muted-foreground">Recent articles fetched by the system.</p>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No articles found.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => {
                let publishedStr = "Recently";
                try {
                  if (article.publishedAt) {
                    publishedStr = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
                  }
                } catch (e) {}

                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-[400px] truncate">
                      <a href={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {article.title}
                      </a>
                    </TableCell>
                    <TableCell>{article.source?.name || "Unknown"}</TableCell>
                    <TableCell suppressHydrationWarning>{publishedStr}</TableCell>
                    <TableCell className="text-right">
                      <ArticleDeleteButton articleId={article.id} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
