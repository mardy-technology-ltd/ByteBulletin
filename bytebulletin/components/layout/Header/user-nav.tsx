"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/actions/auth.actions";
import { User, Bookmark, LayoutDashboard, LogOut, CheckCircle2, Shield } from "lucide-react";

interface UserNavProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex items-center space-x-2.5 rounded-full p-1 border border-border/40 hover:border-primary/40 bg-background/50 hover:bg-card/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        aria-label="User navigation menu"
      >
        <Avatar className="h-8 w-8 border border-primary/30 shadow-xs">
          {user.image && <AvatarImage src={user.image} alt={user.name || "User avatar"} />}
          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-extrabold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden lg:inline-block text-xs font-semibold max-w-[120px] truncate text-foreground/90 group-hover:text-primary pr-2 transition-colors">
          {user.name || user.email?.split("@")[0] || "Account"}
        </span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-60 rounded-2xl p-2 bg-card/95 backdrop-blur-xl border border-border/50 shadow-xl" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-2">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-1.5">
                <p className="text-sm font-extrabold leading-none truncate">{user.name || "User Account"}</p>
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              </div>
              <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
              {user.role === "ADMIN" && (
                <div className="mt-1 inline-flex items-center text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 w-max">
                  <Shield className="w-3 h-3 mr-1" /> Admin
                </div>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border/40" />

        <DropdownMenuGroup>
          <DropdownMenuItem className="rounded-xl cursor-pointer p-0">
            <Link href="/profile" className="flex items-center w-full px-2 py-1.5">
              <User className="mr-2.5 h-4 w-4 text-violet-500" />
              <span className="font-medium">My Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl cursor-pointer p-0">
            <Link href="/bookmarks" className="flex items-center w-full px-2 py-1.5">
              <Bookmark className="mr-2.5 h-4 w-4 text-violet-500" />
              <span className="font-medium">My Bookmarks</span>
            </Link>
          </DropdownMenuItem>

          {user.role === "ADMIN" && (
            <DropdownMenuItem className="rounded-xl cursor-pointer p-0">
              <Link href="/admin" className="flex items-center w-full px-2 py-1.5 text-violet-400 font-semibold">
                <LayoutDashboard className="mr-2.5 h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border/40" />

        <DropdownMenuItem className="rounded-xl cursor-pointer p-0 text-destructive focus:text-destructive">
          <form action={logoutUser} className="w-full">
            <button type="submit" className="w-full flex items-center px-2 py-1.5 text-left">
              <LogOut className="mr-2.5 h-4 w-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
