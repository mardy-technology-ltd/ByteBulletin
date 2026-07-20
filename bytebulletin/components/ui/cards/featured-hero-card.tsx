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
    <Link href={`/news/${slug}`} className="group relative flex h-[60vh] min-h-[400px] w-full flex-col justify-end overflow-hidden rounded-2xl bg-muted transition-all hover:shadow-xl">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300" />
      
      <div className="relative z-10 flex flex-col space-y-4 p-8 sm:p-12 text-white">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md border border-primary/30 uppercase tracking-widest">
            {categoryName}
          </span>
          <span className="text-sm font-medium text-gray-300">
            {timeAgo(publishedAt)}
          </span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-md">
          {title}
        </h2>
        {excerpt && (
          <p className="max-w-2xl text-lg text-gray-200 line-clamp-2 drop-shadow-sm">
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
