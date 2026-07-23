import Link from "next/link";
import { Flame, TrendingUp, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

export async function TrendingWidget() {
  let trendingArticles: Record<string, any>[] = [];

  try {
    trendingArticles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      take: 5,
      orderBy: [
        { bookmarks: { _count: "desc" } },
        { publishedAt: "desc" },
      ],
      include: {
        source: true,
        category: true,
        aiSummary: true,
      },
    });
  } catch (err) {
    console.error("TrendingWidget fetch error:", err);
  }

  if (!trendingArticles || trendingArticles.length === 0) return null;

  return (
    <div className="rounded-3xl border border-violet-500/25 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-5 relative overflow-hidden group">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/10 via-violet-500/5 to-transparent rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Trending Stories
            </h3>
            <p className="text-[11px] text-gray-400">Most read & bookmarked this week</p>
          </div>
        </div>

        <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
          <TrendingUp className="w-3 h-3 mr-1" /> Top 5
        </div>
      </div>

      {/* Trending Items List */}
      <div className="space-y-4 relative z-10 divide-y divide-border/20">
        {trendingArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="flex items-start space-x-3.5 pt-3 first:pt-0 group/item transition-all"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-slate-800 text-amber-400 font-heading font-extrabold text-xs shrink-0 border border-amber-500/20 group-hover/item:bg-violet-600 group-hover/item:text-white transition-all">
              0{index + 1}
            </span>

            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
                  {article.category?.name || "Tech"}
                </span>
                <span className="text-[10px] text-gray-500">• {article.source.name}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover/item:text-violet-400 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h4>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-500 group-hover/item:text-violet-400 shrink-0 self-center transition-transform group-hover/item:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
