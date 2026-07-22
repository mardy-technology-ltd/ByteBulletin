"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils/date";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface FeaturedHeroItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  categoryName: string;
  publishedAt: Date | string;
}

interface FeaturedHeroSliderProps {
  items: FeaturedHeroItem[];
  activeIndex?: number;
  onSelectIndex?: (index: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export function FeaturedHeroSlider({
  items,
  activeIndex: externalIndex,
  onSelectIndex,
  onNext,
  onPrev,
  onHoverChange,
}: FeaturedHeroSliderProps) {
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

  const handleSelect = (index: number) => {
    if (onSelectIndex) {
      onSelectIndex(index);
    } else {
      setInternalIndex(index);
    }
  };

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

  const current = items[currentIndex % totalItems] || items[0];
  const publishedDate = typeof current.publishedAt === "string" ? new Date(current.publishedAt) : current.publishedAt;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[60vh] min-h-[440px] max-h-[560px] overflow-hidden rounded-3xl bg-slate-950 border border-border/40 shadow-2xl group"
    >
      {/* Background Image / Overlay */}
      {current.imageUrl ? (
        <Image
          key={current.id || currentIndex}
          src={current.imageUrl}
          alt={current.title}
          fill
          className="absolute inset-0 object-cover transition-all duration-700 group-hover:scale-105 animate-in fade-in zoom-in-95 duration-500"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-black" />
      )}

      {/* Dark Vignette Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Slide Content Box */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-10 md:p-12 text-white">
        <Link
          key={current.slug}
          href={`/news/${current.slug}`}
          className="flex flex-col space-y-4 max-w-4xl cursor-pointer group/link"
        >
          {/* Category Badge & Published Time */}
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-violet-500/25 px-3.5 py-1 text-xs font-extrabold text-violet-200 backdrop-blur-md border border-violet-400/40 uppercase tracking-widest shadow-md">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>{current.categoryName}</span>
            </span>
            <span className="text-xs font-semibold text-gray-300/90" suppressHydrationWarning>
              {timeAgo(publishedDate)}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] text-white drop-shadow-lg group-hover/link:text-violet-200 transition-colors animate-in fade-in slide-in-from-bottom-3 duration-300">
            {current.title}
          </h2>

          {/* Excerpt */}
          {current.excerpt && (
            <p className="text-sm sm:text-base md:text-lg text-gray-200/90 line-clamp-2 drop-shadow-sm leading-relaxed max-w-3xl">
              {current.excerpt}
            </p>
          )}
        </Link>

        {/* Bottom Carousel Controls Bar */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          {/* Progress Dots / Lines */}
          <div className="flex items-center space-x-2">
            {items.map((item, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={item.id || index}
                  onClick={() => handleSelect(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-8 bg-gradient-to-r from-violet-500 to-indigo-500 shadow-md shadow-violet-500/50"
                      : "w-2.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              );
            })}
          </div>

          {/* Manual Arrow Buttons */}
          {totalItems > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="p-2.5 rounded-full bg-black/40 hover:bg-violet-600/80 text-white backdrop-blur-md border border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Slide"
                className="p-2.5 rounded-full bg-black/40 hover:bg-violet-600/80 text-white backdrop-blur-md border border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
