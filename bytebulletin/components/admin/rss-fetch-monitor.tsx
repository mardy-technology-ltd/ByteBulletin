"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rss, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

type RssLogItem = {
  id: string;
  sourceName: string;
  category: string;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  articlesFound: number;
  articlesCreated: number;
  durationMs: number;
  formattedTime: string;
};

export function RssFetchMonitor({ initialLogs }: { initialLogs?: RssLogItem[] }) {
  const [logs, setLogs] = useState<RssLogItem[]>(initialLogs || []);

  useEffect(() => {
    const fetchRssActivity = async () => {
      try {
        const res = await fetch(`/api/admin/rss/activity?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.logs)) {
          setLogs(json.logs);
        }
      } catch (err) {
        // Silent catch for background polling
      }
    };

    fetchRssActivity();
    const interval = setInterval(fetchRssActivity, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full border-border/50 bg-background shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Rss className="h-4 w-4 text-blue-500" />
          RSS News Fetch Monitor
        </CardTitle>
        <span className="flex items-center gap-1 text-xs text-blue-400 font-sans font-normal bg-blue-950/60 border border-blue-800/50 px-2.5 py-0.5 rounded-full">
          <RefreshCw className="h-3 w-3 animate-spin text-blue-400" /> Auto-Ingest
        </span>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="h-[240px] w-full overflow-y-auto pr-1 space-y-2.5">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <Rss className="h-6 w-6 mb-2 text-muted-foreground/50 animate-pulse" />
              <p className="font-medium">No RSS fetch cycles recorded yet.</p>
              <p className="mt-1 text-[11px] text-muted-foreground/80">Triggers automatically when cron runs /api/cron/fetch-rss</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-2.5 p-3 rounded-lg border bg-card/60 hover:bg-muted/40 transition-colors shadow-2xs">
                <div className="flex items-start gap-2.5 min-w-0">
                  {log.status === "SUCCESS" ? (
                    <CheckCircle2 className="h-4.5 w-4.5 mt-0.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 mt-0.5 text-rose-500 shrink-0" />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {log.sourceName}
                      </p>
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 border border-blue-800/30 px-1.5 py-0.2 rounded">
                        {log.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Found {log.articlesFound} articles • <strong className="text-emerald-500 font-semibold">+{log.articlesCreated} new added</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-foreground/90 block">{log.formattedTime}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{(log.durationMs / 1000).toFixed(1)}s</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
