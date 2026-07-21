import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Rss, Users } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

import { AiProcessingFlow } from "@/components/admin/ai-processing-flow";

export default async function AdminDashboardPage() {
  // Fetch real metrics from DB
  const [totalArticles, totalUsers, activeSources] = await Promise.all([
    prisma.article.count(),
    prisma.user.count(),
    prisma.source.count({ where: { isActive: true } }),
  ]);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <AiProcessingFlow />
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent AI Summaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">GPT-5 Launch Date Leaked</p>
                    <p className="text-xs text-muted-foreground">Processed 2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
