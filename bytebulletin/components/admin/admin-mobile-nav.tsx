"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Users, 
  Rss, 
  BarChart, 
  Mail, 
  Image as ImageIcon,
  Activity,
  Menu,
  X,
  ChevronRight,
  Home
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { AdminSignOutButton } from "@/app/admin/admin-sign-out-button";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Analytics", href: "/admin/analytics", icon: <BarChart className="w-5 h-5" /> },
    { name: "Articles", href: "/admin/articles", icon: <FileText className="w-5 h-5" /> },
    { name: "Sources", href: "/admin/sources", icon: <Rss className="w-5 h-5" /> },
    { name: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { name: "Newsletter", href: "/admin/newsletter", icon: <Mail className="w-5 h-5" /> },
    { name: "Media", href: "/admin/media", icon: <ImageIcon className="w-5 h-5" /> },
    { name: "System Logs", href: "/admin/logs", icon: <Activity className="w-5 h-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-4 sm:hidden">
      <Link href="/admin" className="flex items-center gap-2 font-semibold text-base">
        <span className="font-heading tracking-tight">ByteBulletin <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded-full">Admin</span></span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg border border-border/80 text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Toggle Admin Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-14 z-50 bg-background/95 backdrop-blur-md p-4 overflow-y-auto animate-in slide-in-from-top duration-200 border-b flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Menu Navigation</span>
              <Link href="/" onClick={() => setIsOpen(false)} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Back to Main Site
              </Link>
            </div>

            <nav className="grid gap-1">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30"
                        : "text-foreground/80 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon}
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t mt-6 flex items-center justify-between">
            <ThemeToggle />
            <AdminSignOutButton />
          </div>
        </div>
      )}
    </header>
  );
}
