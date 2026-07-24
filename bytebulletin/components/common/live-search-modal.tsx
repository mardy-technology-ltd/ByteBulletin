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
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
  };

  // Debounced real-time search trigger
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await searchArticlesAction(query);
        setResults(data);
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  // Keyboard navigation within search results list
  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      {/* Mobile/Tablet View Search Button Trigger (Icon Only) */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Search articles"
        className="flex lg:hidden items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-border/80 transition-colors cursor-pointer"
      >
        <Search className="w-4 h-4 text-violet-500 dark:text-violet-400" />
      </button>

      {/* Desktop Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center space-x-3 text-xs text-muted-foreground bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-border/80 hover:border-violet-500/40 rounded-xl px-3.5 py-2 w-64 transition-all shadow-xs cursor-pointer group"
      >
        <Search className="w-4 h-4 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform" />
        <span className="flex-1 text-left font-medium">Search AI articles...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground bg-background border border-border/80 rounded-md shadow-xs">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      {/* Live Search Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-foreground"
          >
            {/* Search Input Box */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-border/50 bg-slate-50/50 dark:bg-slate-950/50">
              <Search className="w-5 h-5 text-violet-500 dark:text-violet-400 mr-3 shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder="Type to search stories, AI tools, topics..."
                className="w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-10 p-0"
              />
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-violet-500 animate-spin shrink-0 ml-2" />
              ) : query ? (
                <button
                  onClick={() => setQuery("")}
                  className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="text-xs font-bold text-muted-foreground bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
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
                    onClick={handleClose}
                    className={`flex items-start space-x-3.5 p-3 rounded-2xl transition-all ${
                      selectedIndex === index
                        ? "bg-violet-500/10 border border-violet-500/40 text-foreground"
                        : "hover:bg-muted/60"
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted border border-border/40">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                          {item.categoryName || "News"}
                        </span>
                        <span>•</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {item.excerpt}
                      </p>
                    </div>
                  </Link>
                ))
              ) : query && !isLoading ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <p className="text-sm font-medium">No results found for &quot;{query}&quot;</p>
                  <p className="text-xs">Try searching for keywords like AI, OpenAI, LLM, or Google.</p>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <div className="flex items-center justify-center space-x-1.5 font-medium text-violet-600 dark:text-violet-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Real-time instant AI search</span>
                  </div>
                  <p>Type keywords to filter live database articles instantaneously.</p>
                </div>
              )}
            </div>

            {/* Footer status bar */}
            {results.length > 0 && (
              <div className="px-4 py-2 bg-slate-100/50 dark:bg-slate-900/50 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span>Showing {results.length} search results</span>
                <span className="hidden sm:inline">Use ↑↓ arrows to navigate, Enter to select</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
