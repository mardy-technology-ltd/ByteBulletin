"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, Sparkles, Command, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchArticlesAction, FeedArticleItem } from "@/actions/article.actions";

export function LiveSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FeedArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchArticlesAction(query);
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation for search results
  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        router.push(`/news/${results[selectedIndex].slug}`);
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Header Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center space-x-3 text-xs text-muted-foreground bg-slate-900/60 dark:bg-slate-900/90 hover:bg-slate-800 border border-violet-500/20 hover:border-violet-500/40 rounded-xl px-3.5 py-2 w-64 transition-all shadow-inner cursor-pointer group"
      >
        <Search className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
        <span className="flex-1 text-left">Search AI articles...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-gray-400 bg-slate-800 border border-gray-700 rounded-md">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      {/* Live Search Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-slate-900 border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-950/50 overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Search Input Box */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-border/40 bg-slate-950/50">
              <Search className="w-5 h-5 text-violet-400 mr-3 shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder="Type to search stories, AI tools, topics..."
                className="w-full bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-10 p-0"
              />
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin shrink-0 ml-2" />
              ) : query ? (
                <button
                  onClick={() => setQuery("")}
                  className="text-gray-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-gray-400 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  ESC
                </button>
              )}
            </div>

            {/* Results Container */}
            <div className="overflow-y-auto p-3 space-y-2 flex-1 divide-y divide-border/20">
              {results.length > 0 ? (
                results.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-start space-x-3.5 p-3 rounded-2xl transition-all ${
                      selectedIndex === index
                        ? "bg-violet-600/20 border border-violet-500/40"
                        : "hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-950 border border-slate-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                          {item.categoryName}
                        </span>
                        <span className="text-xs text-muted-foreground">• {item.sourceName}</span>
                        {item.isAiSummarized && (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-400">
                            <Sparkles className="w-3 h-3 mr-0.5 fill-current" /> AI
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1 leading-snug">
                        {item.title}
                      </h4>
                      {item.excerpt && (
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-violet-400 shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))
              ) : query.trim().length >= 2 && !isLoading ? (
                <div className="py-12 text-center text-sm text-gray-400 space-y-2">
                  <p className="font-semibold text-white">No stories found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-gray-500">Try searching for keywords like AI, OpenAI, Tech, Cloud, or Security.</p>
                </div>
              ) : (
                <div className="py-8 px-4 text-xs text-gray-400 space-y-4">
                  <p className="font-bold uppercase tracking-wider text-violet-400">Popular Search Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {["OpenAI", "ChatGPT Pro", "Cybersecurity", "Apple iPhone 16", "Cloud Computing", "EV Tech"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-violet-600/30 text-gray-300 hover:text-white border border-gray-700/50 transition-all text-xs cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
