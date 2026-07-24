"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Grid } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { mainNav, megaMenuCategories } from "@/config/nav";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth.actions";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  session: any;
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setIsCategoriesExpanded(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-4 sm:p-6 pb-32 shadow-md animate-in slide-in-from-bottom-8 bg-background border-t">
          <div className="relative z-20 grid gap-4 rounded-xl bg-popover p-4 text-popover-foreground shadow-md border border-border/60">
            
            {/* Featured Navigation Links */}
            <nav className="grid grid-flow-row auto-rows-max text-sm gap-1">
              {mainNav.map((item, index) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 font-bold"
                        : "text-foreground/80 hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Expandable 20+ Categories Section */}
            <div className="border-t pt-3 space-y-2">
              <button
                onClick={() => setIsCategoriesExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-violet-500" />
                  <span>All 20+ Topics & Categories</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoriesExpanded ? "rotate-180" : ""}`} />
              </button>

              {isCategoriesExpanded && (
                <div className="grid grid-cols-2 gap-2 pt-2 animate-in fade-in duration-200">
                  {megaMenuCategories.flatMap((group) => group.items).map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={closeMenu}
                      className="p-2 rounded-lg bg-muted/50 hover:bg-violet-500/15 transition-colors border border-border/40 text-xs font-medium text-foreground line-clamp-1"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Footer */}
            <div className="border-t pt-3">
              {session?.user ? (
                <div className="grid gap-2">
                  <span className="text-xs font-medium px-2 py-1 text-muted-foreground truncate">Logged in as {session.user.name || 'User'}</span>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline text-violet-600 dark:text-violet-400 font-semibold"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <form action={logoutUser}>
                    <button type="submit" className="flex w-full items-center rounded-md p-2 text-sm font-medium text-destructive hover:underline cursor-pointer">
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-start")}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className={cn(buttonVariants({ size: "sm" }), "w-full justify-start")}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
