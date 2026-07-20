import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils/date";

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  sourceName: string;
  publishedAt: Date;
  isAiSummarized?: boolean;
}

export function ArticleCard({
  title,
  slug,
  excerpt,
  imageUrl,
  sourceName,
  publishedAt,
  isAiSummarized = false,
}: ArticleCardProps) {
  return (
    <Link href={`/news/${slug}`} className="group flex flex-col space-y-3 relative overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-1 hover:shadow-md">
      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {sourceName}
          </span>
          {isAiSummarized && (
            <span className="flex items-center text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 uppercase tracking-widest">
              <span className="mr-1">✦</span> AI Summary
            </span>
          )}
        </div>
        <h3 className="font-heading text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {excerpt}
          </p>
        )}
        <div className="mt-auto pt-4 flex items-center text-xs text-muted-foreground">
          <time dateTime={publishedAt.toISOString()}>
            {timeAgo(publishedAt)}
          </time>
        </div>
      </div>
    </Link>
  );
}
