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
      <div className="max-w-[1536px] mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="font-bold text-xl inline-block font-heading tracking-tight gradient-text group-hover:opacity-90 transition-opacity">
              {siteConfig.name}
            </span>
          </Link>
          <DesktopNav />
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <LiveSearchModal />
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <UserNav user={user} />
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    Log in
                  </Link>
                  <Link href="/register" className={buttonVariants({ size: "sm" })}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
            <ThemeToggle />
            <MobileNav session={{ ...session, user }} />
          </nav>
        </div>
      </div>
    </header>
  );
}
