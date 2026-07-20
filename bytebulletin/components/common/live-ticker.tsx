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
    <div className="w-full bg-red-500/10 border-b border-red-500/20 text-red-600 dark:text-red-400">
      <div className="container flex items-center h-12 text-sm font-medium">
        <div className="flex items-center shrink-0 mr-4">
          <span className="relative flex h-2.5 w-2.5 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <span className="uppercase tracking-widest font-bold text-xs">Breaking</span>
        </div>
        <div className="flex-1 truncate border-l border-red-500/20 pl-4">
          <Link href={`/news/${latest.slug}`} className="hover:underline flex items-center">
            <span className="truncate mr-2">{latest.title}</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
