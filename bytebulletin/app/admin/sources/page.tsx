import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toggleSourceStatus, deleteSource } from "@/actions/admin.actions";

export const metadata = {
  title: "Sources Management - Admin",
};

export default async function AdminSourcesPage() {
  const sources = await prisma.source.findMany({
    include: {
      category: { select: { name: true } },
      _count: { select: { articles: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold">RSS Sources</h1>
          <p className="text-muted-foreground">Manage news sources and RSS feeds.</p>
        </div>
        <Link href="/admin/sources/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Source
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No sources found. Add your first RSS feed.
                </TableCell>
              </TableRow>
            ) : (
              sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">
                    <a href={source.siteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {source.name}
                    </a>
                    <div className="text-xs text-muted-foreground">{source.feedUrl}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{source.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {source.isActive ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{source.fetchInterval}m</TableCell>
                  <TableCell>{source._count.articles}</TableCell>
                  <TableCell className="text-right">
                    <form className="inline-block mr-2" action={async () => {
                      "use server";
                      await toggleSourceStatus(source.id, !source.isActive);
                    }}>
                      <Button type="submit" variant="ghost" size="icon" title={source.isActive ? "Pause" : "Resume"}>
                        <Settings2 className="w-4 h-4" />
                      </Button>
                    </form>
                    <form className="inline-block" action={async () => {
                      "use server";
                      await deleteSource(source.id);
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
