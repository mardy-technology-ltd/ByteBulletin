"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

type AISummaryItem = {
  id: string;
  formattedTime: string;
  title: string;
  category: string;
  model: string;
};

export function RecentAiSummaries({ initialSummaries }: { initialSummaries: AISummaryItem[] }) {
  const [summaries, setSummaries] = useState<AISummaryItem[]>(initialSummaries || []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch(`/api/admin/ai/activity?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.summaries)) {
          setSummaries(json.summaries);
        }
      } catch (err) {
        // Silent catch for background poll
      }
    };

    fetchRecent();
    const interval = setInterval(fetchRecent, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="col-span-3 border-border/50 bg-background shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          Recent AI Summaries
        </CardTitle>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Live</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3.5">
          {summaries.length === 0 ? (
            <p className="text-xs text-muted-foreground">No summaries generated yet.</p>
          ) : (
            summaries.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-2">
                    {s.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-emerald-400 font-mono text-[11px]">{s.category}</span>
                    <span>•</span>
                    <span>{s.formattedTime}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
