"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2, Radio } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type LogEntry = {
  id: string;
  type: "info" | "process" | "success" | "error" | "wait";
  message: string;
};

export function AiProcessingFlow() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init",
      type: "info",
      message: "⚡ Live Sync Active: Monitoring background Cron Job & manual AI runs...",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const seenSummaryIdsRef = useRef<Set<string>>(new Set());

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Poll for background Cron Job AI completions every 3 seconds
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const res = await fetch(`/api/admin/ai/activity?since=${lastTimestampRef.current}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!json.success) return;

        if (json.timestamp) {
          lastTimestampRef.current = json.timestamp;
        }

        const newLogs: LogEntry[] = [];

        // 1. Process rich cron logs from server buffer
        if (Array.isArray(json.logs)) {
          for (const item of json.logs) {
            newLogs.push({
              id: item.id || Math.random().toString(36).substring(2, 9),
              type: item.type || "info",
              message: item.message,
            });
          }
        }

        // 2. Process DB summaries fallback
        if (Array.isArray(json.summaries)) {
          for (const item of json.summaries) {
            if (!seenSummaryIdsRef.current.has(item.id)) {
              seenSummaryIdsRef.current.add(item.id);
              if (seenSummaryIdsRef.current.size > json.summaries.length) {
                const articleTitle = item.article?.title || item.articleId;
                newLogs.push({
                  id: item.id,
                  type: "success",
                  message: `[CRON LIVE SYNC] ✅ Success: Generated summary for "${articleTitle}"`,
                });
              }
            }
          }
        }

        if (newLogs.length > 0) {
          setLogs((prev) => [...prev, ...newLogs]);
        }
      } catch (err) {
        // Silent catch for background poll
      }
    };

    fetchRecentActivity();
    const interval = setInterval(fetchRecentActivity, 3000);
    return () => clearInterval(interval);
  }, []);

  const startProcessing = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), type: "info", message: "🚀 Manual AI Processing Loop Triggered..." },
    ]);

    const eventSource = new EventSource("/api/admin/ai/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => [
          ...prev,
          { id: Math.random().toString(36).substring(2, 9), type: data.type, message: data.message },
        ]);

        if (data.type === "success" && data.message.includes("All articles processed")) {
          eventSource.close();
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      setLogs((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(2, 9), type: "error", message: "Connection lost or process completed." },
      ]);
      eventSource.close();
      setIsProcessing(false);
    };
  };

  const stopProcessing = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), type: "error", message: "🛑 Processing stopped by user." },
    ]);
    setIsProcessing(false);
  };

  return (
    <Card className="col-span-4 flex flex-col overflow-hidden border-border/50 bg-slate-950 text-slate-300 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-slate-950/80 backdrop-blur pb-3 pt-4">
        <CardTitle className="text-sm font-mono text-slate-100 flex items-center gap-2">
          <span>~/ai/processing-flow</span>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-sans font-normal ml-2 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
            <Radio className="h-3 w-3 animate-pulse text-emerald-400" /> Live Sync
          </span>
          {isProcessing && <Loader2 className="h-3 w-3 animate-spin text-primary ml-1" />}
        </CardTitle>
        <div className="flex space-x-2">
          {isProcessing ? (
            <Button size="sm" variant="destructive" onClick={stopProcessing} className="h-7 text-xs font-mono">
              <Square className="mr-1 h-3 w-3" /> Stop
            </Button>
          ) : (
            <Button size="sm" variant="default" onClick={startProcessing} className="h-7 text-xs font-mono bg-primary/90 hover:bg-primary text-primary-foreground">
              <Play className="mr-1 h-3 w-3" /> Run ai-processor
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          ref={scrollRef}
          className="h-[350px] w-full overflow-y-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed"
        >
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-slate-500 select-none">{">"}</span>
                <span className={`
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'success' ? 'text-green-400 font-semibold' : ''}
                  ${log.type === 'info' ? 'text-blue-400' : ''}
                  ${log.type === 'wait' ? 'text-amber-400 animate-pulse' : ''}
                  ${log.type === 'process' ? 'text-slate-300' : ''}
                `}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
