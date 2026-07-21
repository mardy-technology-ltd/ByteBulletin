"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleBookmarkAction } from "@/actions/bookmark.actions";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  articleId: string;
  initialIsBookmarked?: boolean;
  isAuthenticated: boolean;
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function BookmarkButton({ 
  articleId, 
  initialIsBookmarked = false, 
  isAuthenticated,
  variant = "ghost",
  size = "icon",
  className
}: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = () => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Optimistic UI update
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction(articleId, pathname);
        setIsBookmarked(result.isBookmarked);
      } catch (error) {
        // Revert on error
        setIsBookmarked(previousState);
        console.error("Failed to toggle bookmark:", error);
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200", 
        isBookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={handleToggle}
      disabled={isPending}
      title={isBookmarked ? "Remove bookmark" : "Save article"}
    >
      <Bookmark 
        className={cn("w-5 h-5", isBookmarked && "fill-current")} 
      />
      <span className="sr-only">{isBookmarked ? "Remove bookmark" : "Save article"}</span>
    </Button>
  );
}
