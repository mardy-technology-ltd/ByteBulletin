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
  const seenSummaryIdsRef = useRef<Set<string>>(new Set());

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Poll DB for background Cron Job executions every 3 seconds
  useEffect(() => {
    const fetchDbCronActivity = async () => {
      try {
        const res = await fetch("/api/admin/ai/activity");
        if (!res.ok) {
          console.error("AI Activity fetch failed with status:", res.status);
          return;
        }
        const json = await res.json();
        if (!json.success || !Array.isArray(json.summaries)) return;

        const newLogs: LogEntry[] = [];

        // Process summaries in chronological order (oldest to newest)
        const orderedSummaries = [...json.summaries].reverse();

        for (const item of orderedSummaries) {
          if (!seenSummaryIdsRef.current.has(item.id)) {
            seenSummaryIdsRef.current.add(item.id);

            // Create step-by-step logs for each processed article
            newLogs.push({
              id: `${item.id}-proc`,
              type: "process",
              message: `[${item.formattedTime}] 🚀 Processing article: ${item.title}`,
            });
            newLogs.push({
              id: `${item.id}-succ`,
              type: "success",
              message: `[${item.formattedTime}] ✅ Success (${item.category} | ${item.model})`,
            });
          }
        }

        if (newLogs.length > 0) {
          setLogs((prev) => [...prev, ...newLogs]);
        }
      } catch (err) {
        console.error("Error in fetchDbCronActivity:", err);
      }
    };

    fetchDbCronActivity();
    const interval = setInterval(fetchDbCronActivity, 3000);
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
