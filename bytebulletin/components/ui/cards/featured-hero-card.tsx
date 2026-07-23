import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils/date";

interface FeaturedHeroCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  categoryName: string;
  publishedAt: Date;
}

export function FeaturedHeroCard({
  title,
  slug,
  excerpt,
  imageUrl,
  categoryName,
  publishedAt,
}: FeaturedHeroCardProps) {
  return (
    <Link 
      href={`/news/${slug}`} 
      className="group relative flex h-[60vh] min-h-[420px] w-full flex-col justify-end overflow-hidden rounded-3xl bg-muted border border-border/40 transition-all duration-500 hover:shadow-[0_0_35px_-5px_rgba(124,58,237,0.3)] hover:border-primary/40"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="100vw"
          className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent transition-opacity duration-300" />
      
      <div className="relative z-10 flex flex-col space-y-4 p-6 sm:p-10 text-white">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center rounded-full bg-violet-500/20 px-3.5 py-1 text-xs font-semibold text-violet-200 backdrop-blur-md border border-violet-400/30 uppercase tracking-widest shadow-xs">
            {categoryName}
          </span>
          <span className="text-xs font-medium text-gray-300" suppressHydrationWarning>
            {timeAgo(publishedAt)}
          </span>
        </div>
        <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] text-white drop-shadow-md group-hover:text-violet-100 transition-colors">
          {title}
        </h2>
        {excerpt && (
          <p className="max-w-2xl text-base sm:text-lg text-gray-200/90 line-clamp-2 drop-shadow-sm leading-relaxed">
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
