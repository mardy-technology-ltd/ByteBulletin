import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LiveTickerProps {
  items: { id: string; title: string; slug: string }[];
}

export function LiveTicker({ items }: LiveTickerProps) {
  if (!items || items.length === 0) return null;

  // For a simple implementation, just show the first breaking item.
  // In a full implementation, this could auto-rotate or scroll.
  const latest = items[0];

  return (
    <div className="w-full bg-violet-500/10 dark:bg-violet-950/30 border-b border-violet-500/20 backdrop-blur-md text-violet-700 dark:text-violet-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center h-11 text-xs sm:text-sm font-medium">
        <div className="flex items-center shrink-0 mr-4">
          <span className="relative flex h-2.5 w-2.5 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600 dark:bg-violet-400"></span>
          </span>
          <span className="uppercase tracking-widest font-extrabold text-[11px] text-violet-600 dark:text-violet-400">Breaking</span>
        </div>
        <div className="flex-1 truncate border-l border-violet-500/20 pl-4">
          <Link href={`/news/${latest.slug}`} className="hover:underline flex items-center group">
            <span className="truncate mr-2 font-semibold text-foreground/90 group-hover:text-primary transition-colors">{latest.title}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
