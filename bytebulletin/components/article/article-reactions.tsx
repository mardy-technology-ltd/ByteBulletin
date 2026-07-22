"use client";

import { useState } from "react";
import { toggleArticleReactionAction } from "@/actions/engagement.actions";
import { ReactionType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Sparkles, ThumbsUp, Heart, Lightbulb, Flame } from "lucide-react";

interface ArticleReactionsProps {
  articleId: string;
  initialCounts: Record<ReactionType | "total", number>;
  initialUserReaction?: ReactionType | null;
  isLoggedIn?: boolean;
}

const REACTION_CONFIG: {
  type: ReactionType;
  label: string;
  emoji: string;
  activeGradient: string;
  activeBorder: string;
  activeGlow: string;
  activeTextColor: string;
}[] = [
  {
    type: "LIKE",
    label: "Like",
    emoji: "👍",
    activeGradient: "from-blue-600/25 via-indigo-600/20 to-blue-500/10",
    activeBorder: "border-blue-500/60 shadow-blue-500/25",
    activeGlow: "bg-blue-500/20 text-blue-400",
    activeTextColor: "text-blue-500 dark:text-blue-400",
  },
  {
    type: "LOVE",
    label: "Love",
    emoji: "❤️",
    activeGradient: "from-pink-600/25 via-rose-600/20 to-red-500/10",
    activeBorder: "border-pink-500/60 shadow-pink-500/25",
    activeGlow: "bg-pink-500/20 text-pink-400",
    activeTextColor: "text-pink-500 dark:text-pink-400",
  },
  {
    type: "LAUGH",
    label: "Haha",
    emoji: "😂",
    activeGradient: "from-emerald-600/25 via-teal-600/20 to-green-500/10",
    activeBorder: "border-emerald-500/60 shadow-emerald-500/25",
    activeGlow: "bg-emerald-500/20 text-emerald-400",
    activeTextColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    type: "THINKING",
    label: "Insightful",
    emoji: "🤔",
    activeGradient: "from-amber-600/25 via-yellow-600/20 to-orange-500/10",
    activeBorder: "border-amber-500/60 shadow-amber-500/25",
    activeGlow: "bg-amber-500/20 text-amber-400",
    activeTextColor: "text-amber-500 dark:text-amber-400",
  },
  {
    type: "FIRE",
    label: "Fire",
    emoji: "🔥",
    activeGradient: "from-orange-600/25 via-red-600/20 to-amber-500/10",
    activeBorder: "border-orange-500/60 shadow-orange-500/25",
    activeGlow: "bg-orange-500/20 text-orange-400",
    activeTextColor: "text-orange-500 dark:text-orange-400",
  },
];

export function ArticleReactions({
  articleId,
  initialCounts,
  initialUserReaction = null,
  isLoggedIn = false,
}: ArticleReactionsProps) {
  const router = useRouter();
  const [counts, setCounts] = useState(initialCounts);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialUserReaction);
  const [isPending, setIsPending] = useState(false);

  const handleReaction = async (type: ReactionType) => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/news/${articleId}`);
      return;
    }

    if (isPending) return;
    setIsPending(true);

    // Optimistic state update
    const previousReaction = userReaction;
    const newCounts = { ...counts };

    if (previousReaction === type) {
      // Toggle off
      setUserReaction(null);
      newCounts[type] = Math.max(0, (newCounts[type] || 0) - 1);
      newCounts.total = Math.max(0, (newCounts.total || 0) - 1);
    } else {
      // Switch reaction
      if (previousReaction) {
        newCounts[previousReaction] = Math.max(0, (newCounts[previousReaction] || 0) - 1);
      } else {
        newCounts.total = (newCounts.total || 0) + 1;
      }
      setUserReaction(type);
      newCounts[type] = (newCounts[type] || 0) + 1;
    }

    setCounts(newCounts);

    try {
      const res = await toggleArticleReactionAction(articleId, type);
      if (!res.success) {
        // Revert on failure
        setUserReaction(previousReaction);
        setCounts(initialCounts);
      }
    } catch {
      setUserReaction(previousReaction);
      setCounts(initialCounts);
    } finally {
      setIsPending(false);
    }
  };

  const totalReactions = counts.total || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl my-10">
      {/* Soft Ambient Glow Effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Header Title */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <h3 className="font-heading text-lg font-bold tracking-tight text-foreground">
              What&apos;s your reaction?
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {totalReactions === 0
              ? "Be the first to react to this story!"
              : `${totalReactions} reader${totalReactions === 1 ? "" : "s"} reacted to this story`}
          </p>
        </div>

        {/* Reaction Buttons Grid */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {REACTION_CONFIG.map(({ type, label, emoji, activeGradient, activeBorder, activeGlow, activeTextColor }) => {
            const isActive = userReaction === type;
            const count = counts[type] || 0;

            return (
              <button
                key={type}
                type="button"
                onClick={() => handleReaction(type)}
                disabled={isPending}
                className={`group relative flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-300 cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? `bg-gradient-to-r ${activeGradient} ${activeBorder} shadow-lg ${activeTextColor}`
                    : "border-border/50 bg-background/50 hover:bg-card hover:border-violet-500/40 text-foreground/80 hover:shadow-md"
                }`}
              >
                {/* Emoji Icon with micro-animation */}
                <span className="text-lg transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-0.5 group-hover:rotate-6 inline-block">
                  {emoji}
                </span>

                <span className="font-semibold tracking-tight">{label}</span>

                {/* Counter Badge */}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold transition-colors ${
                    isActive
                      ? `${activeGlow} border border-current/20`
                      : "bg-muted/70 text-muted-foreground group-hover:bg-violet-500/10 group-hover:text-violet-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Reaction Percentage Progress Bar */}
      {totalReactions > 0 && (
        <div className="mt-5 pt-4 border-t border-border/30 flex items-center space-x-1.5 h-3 overflow-hidden rounded-full bg-muted/40 p-0.5">
          {REACTION_CONFIG.map(({ type, activeGradient }) => {
            const count = counts[type] || 0;
            if (count === 0) return null;
            const percentage = Math.round((count / totalReactions) * 100);

            return (
              <div
                key={type}
                style={{ width: `${percentage}%` }}
                className={`h-full rounded-full bg-gradient-to-r ${activeGradient} transition-all duration-500`}
                title={`${type}: ${percentage}%`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
