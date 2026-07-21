import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils/date";

interface ArticleListItemProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  imageUrl: string;
  sourceName: string;
  publishedAt: Date;
  isAiSummarized?: boolean;
}

export function ArticleListItem({
  title,
  slug,
  excerpt,
  imageUrl,
  sourceName,
  publishedAt,
  isAiSummarized = false,
}: ArticleListItemProps) {
  return (
    <Link 
      href={`/news/${slug}`} 
      className="group flex flex-col sm:flex-row gap-5 py-6 border-b border-border/50 last:border-0 transition-colors hover:bg-muted/20 px-2 sm:px-4 rounded-xl -mx-2 sm:-mx-4"
    >
      <div className="relative aspect-[3/2] sm:w-48 md:w-56 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 224px"
        />
      </div>
      
      <div className="flex flex-col flex-1 justify-center">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {sourceName}
          </span>
          {isAiSummarized && (
            <span className="flex items-center text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 uppercase tracking-widest">
              <span className="mr-1">✦</span> AI
            </span>
          )}
        </div>
        
        <h3 className="font-heading text-lg md:text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2 tracking-tight">
          {title}
        </h3>
        
        {excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground mb-3 leading-relaxed">
            {excerpt}
          </p>
        )}
        
        <div className="mt-auto flex items-center text-xs text-muted-foreground/80 font-medium">
          <time dateTime={publishedAt.toISOString()}>
            {timeAgo(publishedAt)}
          </time>
        </div>
      </div>
    </Link>
  );
}
