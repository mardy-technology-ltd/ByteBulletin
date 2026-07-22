import { AISummarySnippet } from "@/components/common/ai-summary-snippet";
import { ShareBar } from "@/components/common/share-bar";
import { ProgressBar } from "@/components/common/progress-bar";
import { FormattedArticleBody } from "@/components/article/formatted-article-body";
import { Metadata } from "next";
import { ArticleRepository } from "@/repositories/article.repository";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { BookmarkRepository } from "@/repositories/bookmark.repository";
import { getArticleReactionsData } from "@/actions/engagement.actions";
import { ArticleReactions } from "@/components/article/article-reactions";
import { CommentSection } from "@/components/article/comment-section";
import { prisma } from "@/lib/db/prisma";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await ArticleRepository.getBySlug(slug);

  if (!article) return {};

  const title = article.seo?.title || article.title;
  const description = article.seo?.description || article.excerpt;
  const url = `https://bytebulletin.com/news/${slug}`;
  const keywords = article.seo?.keywords?.join(", ") || "";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      authors: [article.source.name],
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  };
}

interface NewsDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailsPage({ params }: NewsDetailsPageProps) {
  const { slug } = await params;
  
  // Fetch real article
  const article = await ArticleRepository.getBySlug(slug);
  
  if (!article) {
    notFound();
  }

  const session = await auth();
  const isAuthenticated = !!session?.user;
  
  let initialIsBookmarked = false;
  if (session?.user?.id) {
    initialIsBookmarked = await BookmarkRepository.isBookmarked(session.user.id, article.id);
  }

  // Fetch reactions and comments
  const { counts: reactionCounts, userReaction } = await getArticleReactionsData(article.id, session?.user?.id);

  let comments: any[] = [];
  try {
    const commentModel = (prisma as any)?.comment;
    if (commentModel && typeof commentModel.findMany === "function") {
      comments = await commentModel.findMany({
        where: { articleId: article.id },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      });
    }
  } catch (err) {
    console.error("Comments fetch error:", err);
  }

  // JSON-LD Structured Data for Google News
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.seo?.title || article.title,
    "image": article.imageUrl ? [article.imageUrl] : [],
    "datePublished": article.publishedAt.toISOString(),
    "dateModified": article.updatedAt.toISOString(),
    "author": [{
      "@type": "Organization",
      "name": article.source.name,
      "url": "https://bytebulletin.com"
    }]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProgressBar />
      <article className="max-w-3xl mx-auto py-10 px-4 md:px-8">
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
            <time dateTime={article.publishedAt.toISOString()}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
            <span>•</span>
            <span>{Math.max(1, Math.ceil((article.content?.length || 1000) / 1000))} min read</span>
          </div>
          
          {article.imageUrl && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden my-8">
              <Image 
                src={article.imageUrl} 
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>
        
        {article.aiSummary && (
          <AISummarySnippet
            summary={article.aiSummary.summary}
            summaryPoints={article.aiSummary.keyPoints}
            sentiment={article.aiSummary.sentiment}
          />
        )}

        <FormattedArticleBody
          content={article.content}
          excerpt={article.excerpt}
          sourceName={article.source.name}
          originalUrl={article.originalUrl}
        />

        <ShareBar 
          url={`https://bytebulletin.com/news/${slug}`} 
          title={article.title} 
          articleId={article.id}
          isAuthenticated={isAuthenticated}
          initialIsBookmarked={initialIsBookmarked}
        />

        {/* Emoji Reactions Bar */}
        <ArticleReactions
          articleId={article.id}
          initialCounts={reactionCounts}
          initialUserReaction={userReaction}
          isLoggedIn={isAuthenticated}
        />

        {/* Comments Section */}
        <CommentSection
          articleId={article.id}
          initialComments={comments}
          currentUser={session?.user}
        />
      </article>
    </>
  );
}
