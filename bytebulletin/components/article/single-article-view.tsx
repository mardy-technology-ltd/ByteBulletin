"use client";

import Image from "next/image";
import { AISummarySnippet } from "@/components/common/ai-summary-snippet";
import { ShareBar } from "@/components/common/share-bar";
import { FormattedArticleBody } from "@/components/article/formatted-article-body";
import { AffiliateBannerCard } from "@/components/article/affiliate-banner-card";
import { ArticleReactions } from "@/components/article/article-reactions";
import { CommentSection } from "@/components/article/comment-section";
import { TrendingWidget } from "@/components/common/trending-widget";
import { ReactionType } from "@prisma/client";

export interface SingleArticleData {
  id: string;
  title: string;
  slug: string;
  content?: string | null;
  excerpt?: string | null;
  publishedAt: string | Date;
  imageUrl?: string | null;
  originalUrl?: string | null;
  category?: { name: string; slug: string } | null;
  source: { name: string };
  aiSummary?: {
    summary: string;
    keyPoints?: string[];
    sentiment?: string | null;
  } | null;
  seo?: {
    title?: string | null;
  } | null;
  reactionCounts?: Record<ReactionType | "total", number>;
  userReaction?: ReactionType | null;
  comments?: any[];
}

interface SingleArticleViewProps {
  article: SingleArticleData;
  isAuthenticated: boolean;
  initialIsBookmarked?: boolean;
  isAutoLoaded?: boolean;
}

export function SingleArticleView({
  article,
  isAuthenticated,
  initialIsBookmarked = false,
  isAutoLoaded = false,
}: SingleArticleViewProps) {
  const publishedDate = typeof article.publishedAt === "string" 
    ? new Date(article.publishedAt) 
    : article.publishedAt;

  const readingTime = Math.max(1, Math.ceil((article.content?.length || 1000) / 1000));
  const articleUrl = `https://bytebulletin.com/news/${article.slug}`;

  const defaultReactionCounts: Record<ReactionType | "total", number> = {
    LIKE: 0,
    LOVE: 0,
    LAUGH: 0,
    THINKING: 0,
    FIRE: 0,
    total: 0,
  };

  const reactionCounts = article.reactionCounts || defaultReactionCounts;
  const sentimentValue = (article.aiSummary?.sentiment as "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null) || "NEUTRAL";

  return (
    <article 
      id={`article-${article.slug}`}
      data-slug={article.slug}
      data-title={article.seo?.title || article.title}
      className={`max-w-3xl mx-auto py-10 px-4 md:px-8 ${
        isAutoLoaded ? "border-t border-border/60 pt-16 mt-16" : ""
      }`}
    >
      {isAutoLoaded && (
        <div className="flex items-center space-x-3 mb-8">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Next Story
          </span>
          <div className="h-px bg-border flex-1" />
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {article.category?.name || "General"}
          </span>
          <span className="text-muted-foreground text-sm">•</span>
          <span className="text-muted-foreground text-sm">{article.source.name}</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          {article.title}
        </h1>

        <div className="flex items-center text-muted-foreground space-x-4 text-sm font-medium mb-6">
          <time dateTime={publishedDate.toISOString()}>
            {publishedDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <span>•</span>
          <span>{readingTime} min read</span>
        </div>

        {article.imageUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden my-8">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority={!isAutoLoaded}
            />
          </div>
        )}
      </header>

      {article.aiSummary && (
        <AISummarySnippet
          summary={article.aiSummary.summary}
          summaryPoints={article.aiSummary.keyPoints || []}
          sentiment={sentimentValue}
        />
      )}

      <FormattedArticleBody
        content={article.content}
        excerpt={article.excerpt || undefined}
        sourceName={article.source.name}
        originalUrl={article.originalUrl || undefined}
      />

      <AffiliateBannerCard categorySlug={article.category?.slug} />

      <ShareBar
        url={articleUrl}
        title={article.title}
        articleId={article.id}
        isAuthenticated={isAuthenticated}
        initialIsBookmarked={initialIsBookmarked}
      />

      <ArticleReactions
        articleId={article.id}
        initialCounts={reactionCounts}
        initialUserReaction={article.userReaction}
        isLoggedIn={isAuthenticated}
      />

      <CommentSection
        articleId={article.id}
        initialComments={article.comments || []}
      />

      {!isAutoLoaded && (
        <div className="mt-12">
          <TrendingWidget />
        </div>
      )}
    </article>
  );
}
