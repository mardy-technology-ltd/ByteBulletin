"use client";

import { useState, useEffect } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "./bookmark-button";

interface ShareBarProps {
  url: string;
  title: string;
  articleId: string;
  isAuthenticated: boolean;
  initialIsBookmarked: boolean;
}

export function ShareBar({ url, title, articleId, isAuthenticated, initialIsBookmarked }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    }
  };

  const shareLinks = [
    {
      name: "X (Twitter)",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      hoverBg: "hover:bg-slate-800 hover:text-white border-slate-700",
    },
    {
      name: "Facebook",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverBg: "hover:bg-blue-600 hover:text-white border-blue-500/30",
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      hoverBg: "hover:bg-sky-600 hover:text-white border-sky-500/30",
    },
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.228-1.157zm11.758-7.794c-.066-.109-.241-.174-.505-.306-.264-.132-1.558-.769-1.801-.856-.242-.088-.418-.132-.594.132-.176.265-.683.856-.837 1.033-.154.176-.308.198-.572.066-.264-.132-1.117-.412-2.128-1.314-.787-.702-1.318-1.569-1.472-1.833-.154-.264-.016-.407.116-.538.119-.118.264-.308.396-.462.132-.154.176-.264.264-.44.088-.176.044-.33-.022-.462-.066-.132-.594-1.431-.814-1.96-.214-.516-.432-.446-.594-.454-.154-.007-.33-.007-.505-.007-.176 0-.462.066-.704.33-.242.264-.925.903-.925 2.202s.946 2.553 1.078 2.729c.132.176 1.862 2.844 4.512 3.99.63.272 1.122.434 1.506.556.633.201 1.209.173 1.664.105.508-.076 1.558-.637 1.778-1.253.22-.616.22-1.143.154-1.253z" />
        </svg>
      ),
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%0A%0A${encodedUrl}`,
      hoverBg: "hover:bg-emerald-600 hover:text-white border-emerald-500/30",
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-y border-border/60 my-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2 hidden sm:inline-block">
          Share Story:
        </span>

        {/* Native Mobile Share Button */}
        {canNativeShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="rounded-full gap-1.5 text-xs font-semibold sm:hidden"
          >
            <Share2 className="h-3.5 w-3.5 text-primary" />
            <span>Share</span>
          </Button>
        )}

        {/* Individual Social Share Buttons */}
        {shareLinks.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${item.name}`}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/80 bg-background/80 text-muted-foreground transition-all duration-200 hover:scale-110 active:scale-95 ${item.hoverBg}`}
          >
            {item.icon}
            <span className="sr-only">Share on {item.name}</span>
          </a>
        ))}

        {/* Copy Link Button */}
        <Button
          variant={copied ? "default" : "outline"}
          size="sm"
          onClick={handleCopyLink}
          className={`rounded-full gap-1.5 text-xs font-semibold transition-all ${
            copied ? "bg-emerald-600 text-white border-emerald-600" : ""
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5 text-primary" />}
          <span>{copied ? "Link Copied!" : "Copy Link"}</span>
        </Button>
      </div>

      <BookmarkButton
        articleId={articleId}
        isAuthenticated={isAuthenticated}
        initialIsBookmarked={initialIsBookmarked}
        variant="ghost"
        className="rounded-full h-9 w-9"
      />
    </div>
  );
}
