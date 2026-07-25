"use client";

import { Sparkles, CheckCircle2, Zap, Volume2 } from "lucide-react";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Badge } from "@/components/ui/badge";

interface AISummarySnippetProps {
  summary?: string | null;
  summaryPoints: string[];
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null;
}

export function AISummarySnippet({
  summary,
  summaryPoints,
  sentiment = "NEUTRAL",
}: AISummarySnippetProps) {
  if ((!summaryPoints || summaryPoints.length === 0) && !summary) return null;

  // Combine executive summary and core takeaways for speech synthesis
  const speechParts: string[] = [];
  if (summary) {
    speechParts.push(summary);
  }
  if (summaryPoints && summaryPoints.length > 0) {
    speechParts.push("Core takeaways: " + summaryPoints.join(". "));
  }
  const textToRead = speechParts.join(". ");

  const getSentimentBadge = (sent?: string | null) => {
    switch (sent) {
      case "POSITIVE":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
            😀 Positive Outlook
          </Badge>
        );
      case "NEGATIVE":
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
            ⚠️ Critical Issue
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
            ⚖️ Balanced Analysis
          </Badge>
        );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl my-8 group transition-all duration-300 hover:border-violet-500/50">
      {/* Decorative Ambient Neon Background Blur */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 space-y-5">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-500 dark:text-violet-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-foreground">
                  ByteBulletin Executive Takeaways
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 uppercase tracking-widest">
                  AI-DISTILLED
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                30-Second Smart Briefing & Audio Digest
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getSentimentBadge(sentiment)}
            {/* Built-in Text to Speech Audio Player */}
            {textToRead && <AudioPlayer text={textToRead} />}
          </div>
        </div>

        {/* Executive Summary Paragraph */}
        {summary && (
          <p className="ai-summary-text text-sm sm:text-base text-foreground/90 leading-relaxed font-sans font-normal italic border-l-2 border-violet-500/50 pl-4 py-0.5">
            &ldquo;{summary}&rdquo;
          </p>
        )}

        {/* Bullet Key Points Grid */}
        {summaryPoints && summaryPoints.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" /> Core Impact Points
            </p>
            <ul className="grid grid-cols-1 gap-2.5">
              {summaryPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-3 text-xs sm:text-sm text-foreground/95 bg-muted/40 hover:bg-muted/70 p-3 rounded-xl border border-border/30 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
