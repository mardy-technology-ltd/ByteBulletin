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
      className="group flex flex-col sm:flex-row gap-5 py-5 border-b border-border/40 last:border-0 transition-all duration-300 hover:bg-card/50 hover:border-primary/30 px-3 sm:px-5 rounded-2xl -mx-3 sm:-mx-5 hover:shadow-xs"
    >
      <div className="relative aspect-[3/2] sm:w-48 md:w-56 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/30">
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
            <span className="inline-flex items-center text-[10px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 uppercase tracking-widest bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
              <span className="mr-1 text-violet-500">✦</span> AI Summary
            </span>
          )}
        </div>
        
        <h3 className="font-heading text-lg md:text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2 tracking-tight">
          {title}
        </h3>
        
        {excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground/90 mb-3 leading-relaxed">
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
