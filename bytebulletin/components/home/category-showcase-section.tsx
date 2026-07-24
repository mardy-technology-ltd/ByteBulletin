"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Clock, Tag } from "lucide-react";

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

  const categories = ["ALL", "Technology", "Business", "Science", "World"];

  const filteredArticles =
    activeTab === "ALL"
      ? articles.slice(0, 4)
      : articles.filter((a) => a.categoryName.toLowerCase() === activeTab.toLowerCase()).slice(0, 4);

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

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
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

      {/* 4-Card Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredArticles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group flex flex-col bg-card border border-border/60 hover:border-violet-500/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
          >
            {/* Thumbnail Image */}
            <div className="relative w-full h-44 bg-muted overflow-hidden">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-violet-400" />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 text-violet-500 font-bold group-hover:translate-x-0.5 transition-transform">
                  Read <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
