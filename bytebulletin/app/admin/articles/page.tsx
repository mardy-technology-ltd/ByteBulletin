import { prisma } from "@/lib/db/prisma";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { deleteArticle } from "@/actions/admin.actions";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Articles Management - Admin",
};

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    include: {
      source: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 100, // Limit to recent 100 for performance
  });

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
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[400px] truncate">
                    <a href={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {article.title}
                    </a>
                  </TableCell>
                  <TableCell>{article.source.name}</TableCell>
                  <TableCell suppressHydrationWarning>
                    {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <form className="inline-block" action={async () => {
                      "use server";
                      await deleteArticle(article.id);
                    }}>
                      <Button type="submit" variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
