"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { mainNav } from "@/config/nav";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth.actions";

interface MobileNavProps {
  session: any;
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

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
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-8 bg-background border-t">
          <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
            <nav className="grid grid-flow-row auto-rows-max text-sm">
              {mainNav.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t pt-4">
              {session?.user ? (
                <div className="grid gap-2">
                  <span className="text-sm font-medium px-2 py-1 text-muted-foreground">Logged in as {session.user.name || 'User'}</span>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <form action={logoutUser}>
                    <button type="submit" className="flex w-full items-center rounded-md p-2 text-sm font-medium text-destructive hover:underline">
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
