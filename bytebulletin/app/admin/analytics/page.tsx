import { Metadata } from "next";
import { getAdminAnalyticsData } from "@/actions/admin-analytics.actions";
import { BarChart3, TrendingUp, Users, FileText, Bookmark, MessageSquare, ThumbsUp, Mail, Eye } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Analytics & Traffic Insights | ByteBulletin Admin",
  description: "View real-time audience metrics, article engagement, and category distribution.",
};

export default async function AdminAnalyticsPage() {
  const res = await getAdminAnalyticsData();
  const {
    totalArticles,
    totalUsers,
    totalBookmarks,
    totalComments,
    totalReactions,
    totalSubscribers,
    topArticles,
    categoriesWithCount,
  } = res.data;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <span>Analytics & Insights</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time content engagement, subscriber growth, and category distribution.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Published Stories</span>
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-extrabold font-heading">{totalArticles}</p>
          <p className="text-xs text-muted-foreground">Total news articles indexed</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Users</span>
            <Users className="w-5 h-5 text-violet-500" />
          </div>
          <p className="text-3xl font-extrabold font-heading text-violet-500">{totalUsers}</p>
          <p className="text-xs text-muted-foreground">Registered readers</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Newsletter Subscribers</span>
            <Mail className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold font-heading text-emerald-500">{totalSubscribers}</p>
          <p className="text-xs text-muted-foreground">Tier-1 Executive Leads</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookmarks</span>
            <Bookmark className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold font-heading text-amber-500">{totalBookmarks}</p>
          <p className="text-xs text-muted-foreground">Saved for later reading</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Community Comments</span>
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold font-heading text-blue-500">{totalComments}</p>
          <p className="text-xs text-muted-foreground">Discussion threads</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Emoji Reactions</span>
            <ThumbsUp className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold font-heading text-rose-500">{totalReactions}</p>
          <p className="text-xs text-muted-foreground">Likes, Fire, Insightful tags</p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Top Performing Stories */}
        <div className="lg:col-span-7 rounded-2xl border bg-card shadow-xs overflow-hidden">
          <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
            <h3 className="font-bold font-heading text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Top Engaging Stories</span>
            </h3>
          </div>

          <div className="divide-y">
            {topArticles.map((article: any, index: number) => (
              <div key={article.id} className="p-4 hover:bg-muted/20 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {article.category?.name}
                  </span>
                  <Link href={`/news/${article.slug}`} className="block font-bold text-sm hover:underline line-clamp-1">
                    {index + 1}. {article.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">Source: {article.source.name}</p>
                </div>

                <div className="flex items-center space-x-3 text-xs shrink-0 text-muted-foreground font-semibold">
                  <span title="Bookmarks" className="flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-amber-500" /> {article._count.bookmarks}
                  </span>
                  <span title="Comments" className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> {article._count.comments}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 rounded-2xl border bg-card shadow-xs overflow-hidden">
          <div className="p-5 border-b bg-muted/30">
            <h3 className="font-bold font-heading text-lg">Category Content Distribution</h3>
          </div>

          <div className="p-5 space-y-4">
            {categoriesWithCount.map((cat: any) => {
              const percentage = totalArticles > 0 ? Math.round((cat._count.articles / totalArticles) * 100) : 0;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{cat.name}</span>
                    <span className="text-muted-foreground">{cat._count.articles} stories ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
