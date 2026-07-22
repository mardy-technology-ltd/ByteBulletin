"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/config/nav";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1.5">
      {mainNav.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative px-3 py-1.5 text-sm font-semibold transition-all duration-200 rounded-full select-none ${
              isActive
                ? "text-violet-600 dark:text-violet-400 bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/30 shadow-xs shadow-violet-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
          >
            {item.label}

            {/* Glowing Active Indicator Bar */}
            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 rounded-full shadow-xs shadow-violet-500/50 animate-in fade-in zoom-in-95 duration-200" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
