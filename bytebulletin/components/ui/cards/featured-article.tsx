import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils/date";

interface FeaturedArticleProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  imageUrl: string;
  sourceName: string;
  publishedAt: Date;
  isAiSummarized?: boolean;
}

export function FeaturedArticle({
  title,
  slug,
  excerpt,
  imageUrl,
  sourceName,
  publishedAt,
  isAiSummarized = false,
}: FeaturedArticleProps) {
  return (
    <Link 
      href={`/news/${slug}`} 
      className="group block relative overflow-hidden rounded-2xl border bg-card mb-8 shadow-sm transition-all hover:shadow-lg"
    >
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative aspect-[4/3] md:aspect-auto md:h-full w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex flex-col p-6 md:p-10 lg:p-12 justify-center">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b-2 border-primary/30 pb-1">
              {sourceName}
            </span>
            {isAiSummarized && (
              <span className="flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wider shadow-sm">
                <span className="mr-1">✦</span> AI Summary
              </span>
            )}
          </div>
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-3 mb-4">
            {title}
          </h2>
          {excerpt && (
            <p className="line-clamp-3 text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
              {excerpt}
            </p>
          )}
          <div className="mt-auto flex items-center text-sm text-muted-foreground font-medium">
            <time dateTime={publishedAt.toISOString()} suppressHydrationWarning>
              {timeAgo(publishedAt)}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}
