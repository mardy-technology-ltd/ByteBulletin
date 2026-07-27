import Link from "next/link";
import { timeAgo } from "@/lib/utils/date";
import { decodeHtmlEntities } from "@/lib/utils/string";

interface ListCardProps {
  id: string;
  title: string;
  slug: string;
  sourceName: string;
  publishedAt: Date;
  index?: number;
}

export function ListCard({
  title,
  slug,
  sourceName,
  publishedAt,
  index,
}: ListCardProps) {
  return (
    <Link href={`/news/${slug}`} prefetch={true} className="group flex items-start space-x-4 py-4 border-b border-border/50 last:border-0 transition-colors hover:bg-muted/50 rounded-lg px-2 -mx-2">
      {typeof index === 'number' && (
        <span className="text-2xl font-heading font-extrabold text-muted-foreground/30 min-w-[2rem]">
          {index + 1}
        </span>
      )}
      <div className="flex flex-col flex-1 space-y-1">
        <h4 className="font-heading text-base font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {decodeHtmlEntities(title)}
        </h4>
        <div className="flex items-center text-xs text-muted-foreground space-x-2">
          <span className="font-medium">{sourceName}</span>
          <span>•</span>
          <time dateTime={publishedAt.toISOString()} suppressHydrationWarning>
            {timeAgo(publishedAt)}
          </time>
        </div>
      </div>
    </Link>
  );
}
