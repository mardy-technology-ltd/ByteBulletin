"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { megaMenuCategories } from "@/config/nav";
import {
  ChevronDown,
  Search,
  Brain,
  Cpu,
  Bot,
  Zap,
  Sparkles,
  Code2,
  HardDrive,
  ShieldCheck,
  Cloud,
  Database,
  Building2,
  Rocket,
  TrendingUp,
  Scale,
  Briefcase,
  Globe,
  Dna,
  BatteryCharging,
  Smartphone,
  Gamepad2,
  Grid,
  ArrowUpRight
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="w-4 h-4 text-violet-500" />,
  Cpu: <Cpu className="w-4 h-4 text-cyan-500" />,
  Bot: <Bot className="w-4 h-4 text-emerald-500" />,
  Zap: <Zap className="w-4 h-4 text-amber-500" />,
  Sparkles: <Sparkles className="w-4 h-4 text-fuchsia-500" />,
  Code2: <Code2 className="w-4 h-4 text-blue-500" />,
  HardDrive: <HardDrive className="w-4 h-4 text-indigo-500" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 text-rose-500" />,
  Cloud: <Cloud className="w-4 h-4 text-sky-500" />,
  Database: <Database className="w-4 h-4 text-teal-500" />,
  Building2: <Building2 className="w-4 h-4 text-purple-500" />,
  Rocket: <Rocket className="w-4 h-4 text-orange-500" />,
  TrendingUp: <TrendingUp className="w-4 h-4 text-green-500" />,
  Scale: <Scale className="w-4 h-4 text-yellow-500" />,
  Briefcase: <Briefcase className="w-4 h-4 text-slate-400" />,
  Globe: <Globe className="w-4 h-4 text-indigo-400" />,
  Dna: <Dna className="w-4 h-4 text-pink-500" />,
  BatteryCharging: <BatteryCharging className="w-4 h-4 text-lime-500" />,
  Smartphone: <Smartphone className="w-4 h-4 text-blue-400" />,
  Gamepad2: <Gamepad2 className="w-4 h-4 text-violet-400" />,
};

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const filteredGroups = megaMenuCategories.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(filterQuery.toLowerCase()))
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Mega Menu Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-all duration-200 rounded-full select-none cursor-pointer ${
          isOpen
            ? "text-violet-600 dark:text-violet-400 bg-violet-500/15 border border-violet-500/30 shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-card/60"
        }`}
      >
        <Grid className="w-3.5 h-3.5 text-violet-500" />
        <span>Categories</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-violet-500" : ""}`} />
      </button>

      {/* Floating Glassmorphism Mega Panel */}
      {isOpen && (
        <div
          onMouseLeave={() => setIsOpen(false)}
          className="absolute left-1/2 -translate-x-1/2 mt-2 w-[850px] max-w-[92vw] z-50 bg-background/95 backdrop-blur-2xl border border-border/80 rounded-3xl shadow-2xl p-5 text-foreground animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header Search Filter Bar */}
          <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              <h3 className="font-heading font-bold text-sm tracking-tight text-foreground">
                Explore 20+ Tech Topics & Categories
              </h3>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter categories..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-border/60 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* 4-Column Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-md bg-violet-500/10 inline-block">
                    {group.title}
                  </h4>
                  <div className="space-y-1">
                    {group.items.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-violet-500/10 dark:hover:bg-violet-500/15 transition-all group/item border border-transparent hover:border-violet-500/20"
                      >
                        <div className="p-1.5 rounded-lg bg-muted group-hover/item:bg-background transition-colors shrink-0 mt-0.5">
                          {item.icon && ICON_MAP[item.icon] ? ICON_MAP[item.icon] : <Grid className="w-4 h-4 text-violet-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover/item:text-violet-500 transition-colors">
                            <span className="truncate">{item.label}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 leading-tight">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                No categories matching &quot;{filterQuery}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
