import Link from "next/link";
import { Sparkles } from "lucide-react";

const TRENDING_TAGS = [
  "AI",
  "ChatGPT",
  "Nvidia",
  "Apple",
  "SaaS",
  "Startups",
  "Tesla",
  "Crypto",
];

export function TrendingTags() {
  return (
    <div className="w-full my-4">
      <div className="flex items-center overflow-x-auto gap-3 py-2 px-1 -mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {TRENDING_TAGS.map((tag) => (
          <Link
            key={tag}
            href={`/search?q=${encodeURIComponent(tag.toLowerCase())}`}
            className="group flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full border border-border/60 bg-card/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary/70 group-hover:text-primary transition-colors" />
            <span className="text-sm font-semibold tracking-wide">#{tag}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
