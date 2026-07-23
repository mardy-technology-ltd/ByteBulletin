import { Metadata } from "next";
import { getAdminMediaData } from "@/actions/admin-media.actions";
import { ImageIcon, ExternalLink, FileText, Sparkles, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Media Library | ByteBulletin Admin",
  description: "Browse and manage indexed article hero images, Wikipedia media assets, and CDN thumbnails.",
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const res = await getAdminMediaData(currentPage, 20);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-primary" />
            <span>Media Assets & Thumbnails</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse high-resolution 1200px news graphics, Wikipedia entity images, and automated hero covers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary border-primary/30">
            Total Assets: {res.totalCount}
          </Badge>
        </div>
      </div>

      {/* Media Grid Gallery */}
      {res.articlesWithImage.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground border rounded-2xl bg-card">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="font-semibold text-base">No media assets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {res.articlesWithImage.map((item: any) => (
            <div
              key={item.id}
              className="group rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative w-full aspect-video bg-muted overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                    {item.category?.name || "General"}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1">Source: {item.source?.name}</p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-xs">
                  <Link
                    href={`/news/${item.slug}`}
                    className="inline-flex items-center text-primary font-semibold text-[11px] hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    <span>View Article</span>
                  </Link>

                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground text-[11px]"
                  >
                    <span>Full Res</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {res.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          {res.currentPage > 1 && (
            <Link
              href={`/admin/media?page=${res.currentPage - 1}`}
              className="px-4 py-2 text-xs font-semibold rounded-xl border bg-card hover:bg-muted transition-colors"
            >
              Previous Page
            </Link>
          )}

          <span className="text-xs font-bold text-muted-foreground px-3">
            Page {res.currentPage} of {res.totalPages}
          </span>

          {res.currentPage < res.totalPages && (
            <Link
              href={`/admin/media?page=${res.currentPage + 1}`}
              className="px-4 py-2 text-xs font-semibold rounded-xl border bg-card hover:bg-muted transition-colors"
            >
              Next Page
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
