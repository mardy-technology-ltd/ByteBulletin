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
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-extrabold text-lg tracking-tight text-foreground">
                  AI Key Takeaways
                </h3>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-extrabold border-violet-500/40 text-violet-500 bg-violet-500/10">
                  <Zap className="w-3 h-3 mr-1 fill-current" /> Gemini AI
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Synthesized summary of key facts</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getSentimentBadge(sentiment)}
            <AudioPlayer text={textToRead} />
          </div>
        </div>

        {/* Executive Summary Paragraph (if available) */}
        {summary && (
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-medium italic bg-violet-500/5 dark:bg-violet-500/10 p-4 rounded-2xl border border-violet-500/15">
            &ldquo;{summary}&rdquo;
          </p>
        )}

        {/* Numbered Key Bullet Cards */}
        {summaryPoints && summaryPoints.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-violet-500">
              Core Takeaways
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {summaryPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3.5 p-3.5 sm:p-4 rounded-2xl border border-border/40 bg-background/50 hover:bg-card hover:border-violet-500/30 transition-all duration-200"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/15 text-violet-500 dark:text-violet-400 font-extrabold text-xs shrink-0 mt-0.5 border border-violet-500/30">
                    0{index + 1}
                  </span>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-medium">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
