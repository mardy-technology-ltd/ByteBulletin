"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Rss, Users } from "lucide-react";

type Metrics = {
  totalArticles: number;
  activeSources: number;
  totalUsers: number;
  aiHealth: string;
};

export function DashboardMetrics({ initialMetrics }: { initialMetrics: Metrics }) {
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);

  useEffect(() => {
    const fetchLiveMetrics = async () => {
      try {
        const res = await fetch("/api/admin/ai/activity");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.stats) {
          setMetrics((prev) => ({
            ...prev,
            totalArticles: json.stats.totalArticles ?? prev.totalArticles,
            activeSources: json.stats.activeSources ?? prev.activeSources,
            totalUsers: json.stats.totalUsers ?? prev.totalUsers,
          }));
        }
      } catch (err) {
        // Silent catch for background polling
      }
    };

    const interval = setInterval(fetchLiveMetrics, 2500);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { title: "Total Articles", value: metrics.totalArticles.toLocaleString(), icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
    { title: "Active Sources", value: metrics.activeSources.toString(), icon: <Rss className="h-4 w-4 text-muted-foreground" /> },
    { title: "Total Users", value: metrics.totalUsers.toLocaleString(), icon: <Users className="h-4 w-4 text-muted-foreground" /> },
    { title: "AI Health", value: metrics.aiHealth, icon: <Activity className="h-4 w-4 text-green-500" /> },
  ];

  return (
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
  );
}
