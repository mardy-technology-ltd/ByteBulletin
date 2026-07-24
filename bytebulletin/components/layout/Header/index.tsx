import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth/config";
import { MobileNav } from "./mobile-nav";
import { DesktopNav } from "./desktop-nav";
import { prisma } from "@/lib/db/prisma";
import { UserNav } from "./user-nav";
import { LiveSearchModal } from "@/components/common/live-search-modal";
import { User as UserIcon } from "lucide-react";

export async function Header() {
  const session = await auth();

  let user = session?.user;

  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, role: true },
    });
    if (dbUser) {
      user = {
        ...session.user,
        name: dbUser.name || session.user.name,
        image: dbUser.image || session.user.image,
      };
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-4 md:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="font-bold text-lg sm:text-xl inline-block font-heading tracking-tight gradient-text group-hover:opacity-90 transition-opacity">
              {siteConfig.name}
            </span>
          </Link>
          <DesktopNav />
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-1.5 sm:space-x-2">
            <LiveSearchModal />
            
            {user ? (
              <UserNav user={user} />
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    Log in
                  </Link>
                  <Link href="/register" className={buttonVariants({ size: "sm" })}>
                    Sign up
                  </Link>
                </div>
                <Link
                  href="/login"
                  className="flex sm:hidden items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-border/80 transition-colors"
                  aria-label="Log in"
                >
                  <UserIcon className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                </Link>
              </>
            )}
            
            <ThemeToggle />
            <MobileNav session={{ ...session, user }} />
          </nav>
        </div>
      </div>
    </header>
  );
}
