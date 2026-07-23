import { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bytebulletin.com";

  // Static legal & core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclosures`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Fetch top published categories
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({ select: { slug: true, updatedAt: true } });
    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "hourly",
      priority: 0.8,
    }));
  } catch (e) {
    console.error("Sitemap categories error:", e);
  }

  // Fetch recent 500 published articles for instant Google News indexing
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      take: 500,
      orderBy: { publishedAt: "desc" },
      select: { slug: true, updatedAt: true },
    });
    articleRoutes = articles.map((art) => ({
      url: `${baseUrl}/news/${art.slug}`,
      lastModified: art.updatedAt,
      changeFrequency: "daily",
      priority: 0.9,
    }));
  } catch (e) {
    console.error("Sitemap articles error:", e);
  }

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
