import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Rss, Users } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

import { AiProcessingFlow } from "@/components/admin/ai-processing-flow";
import { RecentAiSummaries } from "@/components/admin/recent-ai-summaries";
import { RssFetchMonitor } from "@/components/admin/rss-fetch-monitor";

export default async function AdminDashboardPage() {
  // Fetch real metrics & recent AI summaries from DB
  const [totalArticles, totalUsers, activeSources, dbSummaries] = await Promise.all([
    prisma.article.count(),
    prisma.user.count(),
    prisma.source.count({ where: { isActive: true } }),
    prisma.aISummary.findMany({
      take: 8,
      orderBy: { generatedAt: "desc" },
      include: { article: { select: { title: true, category: { select: { name: true } } } } },
    }),
  ]);

  const initialSummaries = dbSummaries.map((s) => ({
    id: s.id,
    formattedTime: s.generatedAt ? new Date(s.generatedAt).toLocaleTimeString() : "Recently",
    title: s.article?.title || s.articleId,
    category: s.article?.category?.name || "General",
    model: s.model,
  }));

  const cards = [
    { title: "Total Articles", value: totalArticles.toLocaleString(), icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
    { title: "Active Sources", value: activeSources.toString(), icon: <Rss className="h-4 w-4 text-muted-foreground" /> },
    { title: "Total Users", value: totalUsers.toLocaleString(), icon: <Users className="h-4 w-4 text-muted-foreground" /> },
    { title: "AI Health", value: "99.8%", icon: <Activity className="h-4 w-4 text-green-500" /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor the health and performance of the AI News Aggregator.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 1. RSS News Fetch Monitor at TOP */}
      <div className="mt-8">
        <RssFetchMonitor />
      </div>

      {/* 2. AI Summary Processing & Cron Monitor + Recent AI Summaries below */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <AiProcessingFlow />
        <RecentAiSummaries initialSummaries={initialSummaries} />
      </div>
    </div>
  );
}
