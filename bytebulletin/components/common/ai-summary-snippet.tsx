import { Sparkles } from "lucide-react";

interface AISummarySnippetProps {
  summaryPoints: string[];
}

export function AISummarySnippet({ summaryPoints }: AISummarySnippetProps) {
  if (!summaryPoints || summaryPoints.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm mb-8 relative overflow-hidden group">
      {/* Decorative background gradient */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <h3 className="font-heading font-bold text-lg mb-4 flex items-center tracking-tight">
          <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            AI Summary
          </span>
        </h3>
        
        <ul className="space-y-3">
          {summaryPoints.map((point, index) => (
            <li key={index} className="flex items-start text-muted-foreground text-sm sm:text-base">
              <span className="mr-3 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500/50" />
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
