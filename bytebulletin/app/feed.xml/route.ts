import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thebytebulletin.com";

  try {
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() }
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: {
        category: { select: { name: true } },
        source: { select: { name: true } },
      }
    });

    const feedItems = articles.map(article => {
      const articleUrl = `${baseUrl}/news/${article.slug}`;
      const pubDate = new Date(article.publishedAt).toUTCString();
      
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${article.excerpt}]]></description>
      ${article.category ? `<category><![CDATA[${article.category.name}]]></category>` : ""}
      <source url="${baseUrl}">${article.source.name}</source>
    </item>`;
    }).join("");

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ByteBulletin</title>
    <link>${baseUrl}</link>
    <description>The latest and most important stories in Technology, Business, Science, and World news.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${feedItems}
  </channel>
</rss>`;

    return new NextResponse(rssFeed, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=60, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("RSS Feed Generation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
