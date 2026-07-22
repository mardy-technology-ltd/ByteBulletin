import { prisma } from "@/lib/db/prisma";
import { formatBdTime } from "@/lib/utils/format-time";

import { DashboardMetrics } from "@/components/admin/dashboard-metrics";
import { AiProcessingFlow } from "@/components/admin/ai-processing-flow";
import { RecentAiSummaries } from "@/components/admin/recent-ai-summaries";
import { RssFetchMonitor } from "@/components/admin/rss-fetch-monitor";

export default async function AdminDashboardPage() {
  // Fetch real metrics, recent AI summaries, and recent RSS fetch logs directly from DB
  const [totalArticles, totalUsers, activeSources, dbSummaries, dbRssLogs] = await Promise.all([
    prisma.article.count(),
    prisma.user.count(),
    prisma.source.count({ where: { isActive: true } }),
    prisma.aISummary.findMany({
      take: 8,
      orderBy: { generatedAt: "desc" },
      include: { article: { select: { title: true, category: { select: { name: true } } } } },
    }),
    prisma.rssFetchLog.findMany({
      take: 15,
      orderBy: { fetchedAt: "desc" },
      include: {
        source: {
          select: {
            name: true,
            category: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const initialMetrics = {
    totalArticles,
    activeSources,
    totalUsers,
    aiHealth: "99.8%",
  };

  const initialSummaries = dbSummaries.map((s) => ({
    id: s.id,
    formattedTime: formatBdTime(s.generatedAt),
    title: s.article?.title || s.articleId,
    category: s.article?.category?.name || "General",
    model: s.model,
  }));

  const initialRssLogs = dbRssLogs.map((l) => ({
    id: l.id,
    sourceName: l.source?.name || "Unknown Source",
    category: l.source?.category?.name || "General",
    status: l.status,
    articlesFound: l.articlesFound,
    articlesCreated: l.articlesCreated,
    durationMs: l.duration,
    formattedTime: formatBdTime(l.fetchedAt),
  }));

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor the health and performance of the AI News Aggregator.</p>
      </div>

      {/* Real-time Auto-updating Metrics Cards */}
      <DashboardMetrics initialMetrics={initialMetrics} />

      {/* 1. RSS News Fetch Monitor at TOP */}
      <div className="mt-8">
        <RssFetchMonitor initialLogs={initialRssLogs} />
      </div>

      {/* 2. AI Summary Processing & Cron Monitor + Recent AI Summaries below */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <AiProcessingFlow />
        <RecentAiSummaries initialSummaries={initialSummaries} />
      </div>
    </div>
  );
}
