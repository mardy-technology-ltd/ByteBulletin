"use client";

import { TrendingUp, TrendingDown, Cpu, Activity } from "lucide-react";

export function TechMarketWidget() {
  const stocks = [
    { symbol: "NVDA", name: "NVIDIA Corp", price: "$128.40", change: "+3.8%", isUp: true },
    { symbol: "MSFT", name: "Microsoft", price: "$448.90", change: "+1.6%", isUp: true },
    { symbol: "GOOGL", name: "Alphabet Inc", price: "$182.30", change: "+2.1%", isUp: true },
    { symbol: "AMD", name: "Adv Micro Dev", price: "$156.70", change: "+4.2%", isUp: true },
    { symbol: "AAPL", name: "Apple Inc", price: "$224.10", change: "-0.4%", isUp: false },
  ];

  return (
    <div className="w-full bg-slate-900/60 dark:bg-slate-950/80 border border-border/60 rounded-3xl p-4 shadow-md backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-foreground">
              AI Tech Index
            </h3>
            <p className="text-[10px] text-muted-foreground">Real-time market signals</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>

      <div className="space-y-2">
        {stocks.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-xl bg-background/50 hover:bg-violet-500/10 transition-colors border border-border/30 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1 rounded-md bg-muted text-muted-foreground shrink-0 font-mono text-[10px] font-bold">
                {s.symbol}
              </div>
              <span className="font-medium text-foreground truncate text-[11px]">{s.name}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono font-semibold text-foreground text-[11px]">{s.price}</span>
              <span
                className={`flex items-center gap-0.5 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  s.isUp
                    ? "text-emerald-400 bg-emerald-950/60 border border-emerald-800/30"
                    : "text-rose-400 bg-rose-950/60 border border-rose-800/30"
                }`}
              >
                {s.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
