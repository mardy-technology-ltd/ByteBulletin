import Link from "next/link";
import { siteConfig } from "@/config/site";
import { mainNav } from "@/config/nav";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth/config";
import { LogOut, User } from "lucide-react";
import { logoutUser } from "@/actions/auth.actions";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl inline-block font-heading">
              {siteConfig.name}
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {mainNav.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session?.user ? (
              <div className="flex items-center gap-4">
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary">
                    Dashboard
                  </Link>
                )}
                <form action={logoutUser}>
                  <button type="submit" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </form>
              </div>
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
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
