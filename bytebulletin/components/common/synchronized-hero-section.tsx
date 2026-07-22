"use client";

import { useState, useEffect, useCallback } from "react";
import { LiveTicker } from "@/components/common/live-ticker";
import { FeaturedHeroSlider, FeaturedHeroItem } from "@/components/ui/cards/featured-hero-slider";

interface TickerItem {
  id: string;
  title: string;
  slug: string;
  categoryName?: string;
}

interface SynchronizedHeroSectionProps {
  tickerItems: TickerItem[];
  heroItems: FeaturedHeroItem[];
}

export function SynchronizedHeroSection({
  tickerItems,
  heroItems,
}: SynchronizedHeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = Math.max(tickerItems.length, heroItems.length);

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Master Synchronized Interval (5 seconds)
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [total, isPaused, nextSlide]);

  return (
    <div className="space-y-8">
      {/* Synchronized Breaking News Ticker */}
      {tickerItems.length > 0 && (
        <LiveTicker
          items={tickerItems}
          activeIndex={activeIndex}
          onNext={nextSlide}
          onPrev={prevSlide}
          onHoverChange={setIsPaused}
        />
      )}

      {/* Synchronized Main Featured Hero Slider */}
      {heroItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <FeaturedHeroSlider
            items={heroItems}
            activeIndex={activeIndex}
            onSelectIndex={setActiveIndex}
            onNext={nextSlide}
            onPrev={prevSlide}
            onHoverChange={setIsPaused}
          />
        </div>
      )}
    </div>
  );
}
