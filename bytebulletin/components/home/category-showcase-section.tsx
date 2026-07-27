"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { defaultBlurDataURL } from "@/lib/utils/image";
import { ArrowRight, Sparkles, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils/string";

interface ShowcaseArticle {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  categoryName: string;
  excerpt: string;
  publishedAt: string;
}

interface CategoryShowcaseSectionProps {
  articles: ShowcaseArticle[];
}

export function CategoryShowcaseSection({ articles }: CategoryShowcaseSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = ["ALL", "Technology", "Business", "Science", "World"];

  const filteredArticles =
    activeTab === "ALL"
      ? articles
      : articles.filter((a) => a.categoryName?.toLowerCase() === activeTab.toLowerCase());

  // Automatic scrolling logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || filteredArticles.length === 0) return;

    let isPaused = false;

    const handleMouseEnter = () => (isPaused = true);
    const handleMouseLeave = () => (isPaused = false);

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    const scrollInterval = setInterval(() => {
      if (!container || isPaused) return;
      
      // Calculate one card width including gap
      const firstCard = container.children[0] as HTMLElement;
      const scrollAmount = firstCard ? firstCard.clientWidth + 20 : 340; // fallback to 340
      
      // If we've reached the end, scroll back to the start
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 2500); // 2.5 seconds per slide (includes pause and transition time)

    return () => {
      clearInterval(scrollInterval);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [filteredArticles, activeTab]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const firstCard = scrollContainerRef.current.children[0] as HTMLElement;
      const scrollAmount = firstCard ? firstCard.clientWidth + 20 : 340;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const firstCard = scrollContainerRef.current.children[0] as HTMLElement;
      const scrollAmount = firstCard ? firstCard.clientWidth + 20 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!articles || articles.length === 0) return null;

  return (
    <section className="w-full my-12 space-y-6">
      {/* Section Header & Tab Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 text-violet-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Topic Showcase
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight">
            Explore Curated Categories
          </h2>
        </div>

        {/* Tab Buttons & Navigation Arrows */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  // Reset scroll when changing tabs
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === cat
                    ? "bg-violet-500 text-white shadow-md shadow-violet-500/30"
                    : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Slider / Carousel */}
      {filteredArticles.length > 0 ? (
        <div className="relative group/slider w-full md:px-20">
          <button 
            onClick={scrollLeft}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-800/90 border border-slate-700/50 backdrop-blur-md shadow-lg text-white hover:scale-105 hover:shadow-violet-500/20 transition-all hidden md:flex disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-5 scrollbar-none pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for Firefox and IE
          >
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex flex-col shrink-0 w-[280px] sm:w-[320px] bg-card border border-border/60 hover:border-violet-500/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
              >
              {/* Thumbnail Image */}
              <div className="relative w-full h-44 bg-muted overflow-hidden">
                <Image
                  src={article.imageUrl}
                  alt={decodeHtmlEntities(article.title)}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  placeholder="blur"
                  blurDataURL={defaultBlurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-violet-600/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                  {article.categoryName}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-violet-500 transition-colors line-clamp-2 leading-snug">
                    {decodeHtmlEntities(article.title)}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {decodeHtmlEntities(article.excerpt)}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-violet-400" />
                    {new Date(article.publishedAt).toLocaleDateString("en-US")}
                  </span>
                  <span className="flex items-center gap-1 text-violet-500 font-bold group-hover:translate-x-0.5 transition-transform">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
            ))}
          </div>

          <button 
            onClick={scrollRight}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-800/90 border border-slate-700/50 backdrop-blur-md shadow-lg text-white hover:scale-105 hover:shadow-violet-500/20 transition-all hidden md:flex disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground border border-border/50 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 shadow-sm flex flex-col items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 opacity-20" />
          <p className="font-medium text-sm">No articles found in this category.</p>
        </div>
      )}
    </section>
  );
}
