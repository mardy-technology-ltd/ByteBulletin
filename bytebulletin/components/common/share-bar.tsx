"use client";

import { Share2, Link as LinkIcon, Bookmark } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

import { BookmarkButton } from "./bookmark-button";

interface ShareBarProps {
  url: string;
  title: string;
  articleId: string;
  isAuthenticated: boolean;
  initialIsBookmarked: boolean;
}

export function ShareBar({ url, title, articleId, isAuthenticated, initialIsBookmarked }: ShareBarProps) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center space-x-2 py-4 border-y border-border/50 my-8">
      <span className="text-sm font-medium text-muted-foreground mr-4 hidden sm:inline-block">
        Share
      </span>
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "outline", size: "icon", className: "rounded-full" })}
      >
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Share on Twitter</span>
      </a>
      <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={handleCopyLink}>
        <LinkIcon className="h-4 w-4" />
        <span className="sr-only">Copy link</span>
      </Button>
      
      <div className="flex-1" />
      
      <BookmarkButton 
        articleId={articleId} 
        isAuthenticated={isAuthenticated} 
        initialIsBookmarked={initialIsBookmarked} 
        variant="ghost" 
        className="rounded-full h-10 w-10" 
      />
    </div>
  );
}
