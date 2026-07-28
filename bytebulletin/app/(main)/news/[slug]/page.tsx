import { ProgressBar } from "@/components/common/progress-bar";
import { Metadata } from "next";
import { ArticleRepository } from "@/repositories/article.repository";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { BookmarkRepository } from "@/repositories/bookmark.repository";
import { getArticleReactionsData } from "@/actions/engagement.actions";
import { prisma } from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { InfiniteArticleFeed } from "@/components/article/infinite-article-feed";

const getGlobalCachedArticle = unstable_cache(
  async (slug: string) => {
    return await ArticleRepository.getBySlug(slug);
  },
  ['article-by-slug-cache'],
  { revalidate: 300 } // Cache for 5 minutes globally
);

const getCachedArticle = async (slug: string) => {
  const article = await getGlobalCachedArticle(slug);
  if (article) {
    if (typeof article.publishedAt === "string") article.publishedAt = new Date(article.publishedAt);
    if (typeof article.updatedAt === "string") article.updatedAt = new Date(article.updatedAt);
    if (typeof article.createdAt === "string") article.createdAt = new Date(article.createdAt);
  }
  return article;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticle(slug);

  if (!article) return {};

  const title = article.seo?.title || article.title;
  const description = article.seo?.description || article.excerpt;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thebytebulletin.com";
  const url = `${siteUrl}/news/${slug}`;

  const categoryName = article.category?.name || "Tech";
  const sourceName = article.source?.name || "ByteBulletin";

  const dynamicOgUrl = `${siteUrl}/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(categoryName)}&source=${encodeURIComponent(sourceName)}`;

  const ogImages = [
    ...(article.imageUrl ? [{ url: article.imageUrl }] : []),
    {
      url: dynamicOgUrl,
      width: 1200,
      height: 630,
      alt: title,
    },
  ];

  return {
    title,
    description,
    keywords: article.seo?.keywords?.join(", ") || "",
    alternates: {
      canonical: url,
    },
    openGraph: {
      siteName: "ByteBulletin",
      title,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      authors: [sourceName],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.imageUrl || dynamicOgUrl],
    },
  };
}

interface NewsDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailsPage({ params }: NewsDetailsPageProps) {
  const { slug } = await params;
  
  // Fetch real article
  const article = await getCachedArticle(slug);
  
  if (!article) {
    notFound();
  }

  const session = await auth();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id;
  
  // Parallelize secondary data fetching to reduce load time
  const [initialIsBookmarked, reactionsData, commentsList] = await Promise.all([
    userId ? BookmarkRepository.isBookmarked(userId, article.id) : Promise.resolve(false),
    getArticleReactionsData(article.id, userId),
    (async () => {
      try {
        const commentModel = (prisma as any)?.comment;
        if (commentModel && typeof commentModel.findMany === "function") {
          return await commentModel.findMany({
            where: { articleId: article.id },
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          });
        }
      } catch (err) {
        console.error("Comments fetch error:", err);
      }
      return [];
    })()
  ]);

  const { counts: reactionCounts, userReaction } = reactionsData;
  const comments = commentsList;

  // Enriched Multi-Schema JSON-LD Structured Data for Google News, Discover & AI Overviews
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thebytebulletin.com";
  const canonicalUrl = `${siteUrl}/news/${slug}`;

  const title = article.seo?.title || article.title;
  const categoryName = article.category?.name || "Tech";
  const sourceName = article.source?.name || "ByteBulletin";
  const dynamicOgUrl = `${siteUrl}/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(categoryName)}&source=${encodeURIComponent(sourceName)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${canonicalUrl}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": canonicalUrl,
          "url": canonicalUrl,
          "name": title
        },
        "headline": title,
        "description": article.seo?.description || article.excerpt,
        "image": [dynamicOgUrl, ...(article.imageUrl ? [article.imageUrl] : [])],
        "datePublished": article.publishedAt.toISOString(),
        "dateModified": article.updatedAt.toISOString(),
        "mainEntityOfPage": canonicalUrl,
        "author": {
          "@type": "Organization",
          "name": article.source.name,
          "url": article.originalUrl || canonicalUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "ByteBulletin",
          "url": siteUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.png`
          }
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".ai-summary-text"]
        }
      },
      ...(article.aiSummary?.keyPoints && article.aiSummary.keyPoints.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${canonicalUrl}#faq`,
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `What are the key takeaways from "${title}"?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": article.aiSummary.keyPoints.join(" ")
                  }
                }
              ]
            }
          ]
        : [])
    ]
  };

  const initialArticleData = {
    ...article,
    reactionCounts,
    userReaction,
    comments,
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProgressBar />
      
      <InfiniteArticleFeed
        initialArticle={initialArticleData}
        isAuthenticated={isAuthenticated}
        initialIsBookmarked={initialIsBookmarked}
        categorySlug={article.category?.slug}
        maxAutoLoad={2}
      />
    </>
  );
}
