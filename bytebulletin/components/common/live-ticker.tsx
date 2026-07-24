"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface LiveTickerProps {
  items: { id: string; title: string; slug: string; categoryName?: string }[];
  activeIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export function LiveTicker({
  items,
  activeIndex: externalIndex,
  onNext,
  onPrev,
  onHoverChange,
}: LiveTickerProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isExternalControlled = externalIndex !== undefined;
  const currentIndex = isExternalControlled ? externalIndex : internalIndex;
  const totalItems = items ? items.length : 0;

  const handleNext = useCallback(() => {
    if (onNext) {
      onNext();
    } else if (totalItems > 1) {
      setInternalIndex((prev) => (prev + 1) % totalItems);
    }
  }, [onNext, totalItems]);

  const handlePrev = useCallback(() => {
    if (onPrev) {
      onPrev();
    } else if (totalItems > 1) {
      setInternalIndex((prev) => (prev - 1 + totalItems) % totalItems);
    }
  }, [onPrev, totalItems]);

  // Internal auto-rotate fallback if not controlled externally
  useEffect(() => {
    if (isExternalControlled || totalItems <= 1 || isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isExternalControlled, totalItems, isPaused, handleNext]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (onHoverChange) onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (onHoverChange) onHoverChange(false);
  };

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex % totalItems] || items[0];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full bg-violet-500/10 dark:bg-violet-950/30 border-b border-violet-500/20 backdrop-blur-md text-violet-700 dark:text-violet-300 transition-colors"
    >
      <div className="max-w-[1536px] mx-auto px-3 sm:px-4 md:px-8 py-2 sm:py-0">
        
        {/* MOBILE VIEW: Two-Row Layout */}
        <div className="flex sm:hidden flex-col gap-1.5 py-0.5">
          {/* Top Row: Breaking News Tag + Counter & Navigation Arrows */}
          <div className="flex items-center justify-between text-xs font-medium border-b border-violet-500/15 pb-1">
            <div className="flex items-center">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600 dark:bg-violet-400"></span>
              </span>
              <span className="uppercase tracking-widest font-extrabold text-[10px] text-violet-600 dark:text-violet-400">
                Breaking News
              </span>
            </div>

            {totalItems > 1 && (
              <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground">
                <span className="text-[10px] font-extrabold text-violet-500/80 mr-1">
                  {currentIndex + 1} / {totalItems}
                </span>

                <button
                  onClick={handlePrev}
                  aria-label="Previous Breaking News"
                  className="p-1 rounded-md hover:bg-violet-500/15 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleNext}
                  aria-label="Next Breaking News"
                  className="p-1 rounded-md hover:bg-violet-500/15 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Row: Full-width Headline */}
          <div className="w-full min-w-0">
            <Link
              key={currentItem.id || currentIndex}
              href={`/news/${currentItem.slug}`}
              className="hover:underline flex items-center justify-between group animate-in fade-in slide-in-from-bottom-1 duration-300 w-full"
            >
              <span className="font-semibold text-foreground/90 group-hover:text-primary transition-colors text-xs leading-snug line-clamp-2 flex-1 mr-2">
                {currentItem.title}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* DESKTOP & TABLET VIEW: Single-Row Layout */}
        <div className="hidden sm:flex items-center justify-between h-11 text-sm font-medium">
          {/* Left Side: Pulse Badge + Breaking Label */}
          <div className="flex items-center shrink-0 mr-4">
            <span className="relative flex h-2.5 w-2.5 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600 dark:bg-violet-400"></span>
            </span>
            <span className="uppercase tracking-widest font-extrabold text-[11px] text-violet-600 dark:text-violet-400 whitespace-nowrap">
              Breaking News
            </span>
          </div>

          {/* Center: Dynamic Animated Ticker Link */}
          <div className="flex-1 min-w-0 border-l border-violet-500/20 pl-4">
            <Link
              key={currentItem.id || currentIndex}
              href={`/news/${currentItem.slug}`}
              className="hover:underline flex items-center group animate-in fade-in slide-in-from-bottom-2 duration-300 w-full"
            >
              <span className="truncate mr-2 font-semibold text-foreground/90 group-hover:text-primary transition-colors text-sm flex-1">
                {currentItem.title}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Side: Manual Navigation Arrows & Counter */}
          {totalItems > 1 && (
            <div className="flex items-center space-x-2 shrink-0 ml-4 border-l border-violet-500/20 pl-3 text-xs font-semibold text-muted-foreground">
              <span className="text-[11px] font-extrabold text-violet-500/80 mr-1">
                {currentIndex + 1} / {totalItems}
              </span>

              <button
                onClick={handlePrev}
                aria-label="Previous Breaking News"
                className="p-1 rounded-md hover:bg-violet-500/15 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next Breaking News"
                className="p-1 rounded-md hover:bg-violet-500/15 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
