"use server";

import { prisma } from "@/lib/db/prisma";

export async function getAdminAnalyticsData() {
  try {
    const totalArticles = await prisma.article.count({ where: { status: "PUBLISHED" } });
    const totalUsers = await prisma.user.count();
    const totalBookmarks = await prisma.bookmark.count();
    const totalComments = await prisma.comment.count();
    const totalReactions = await prisma.articleReaction.count();
    const totalSubscribers = await prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } });

    // Recent 10 Published Articles with engagement counts
    const topArticles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      take: 5,
      orderBy: [
        { bookmarks: { _count: "desc" } },
        { comments: { _count: "desc" } },
        { publishedAt: "desc" },
      ],
      include: {
        source: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        _count: {
          select: {
            bookmarks: true,
            comments: true,
            reactions: true,
          },
        },
      },
    });

    // Category breakdown count
    const categoriesWithCount = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { articles: { _count: "desc" } },
    });

    return {
      success: true,
      data: {
        totalArticles,
        totalUsers,
        totalBookmarks,
        totalComments,
        totalReactions,
        totalSubscribers,
        topArticles,
        categoriesWithCount,
      },
    };
  } catch (error) {
    console.error("[getAdminAnalyticsData Error]:", error);
    return {
      success: false,
      data: {
        totalArticles: 0,
        totalUsers: 0,
        totalBookmarks: 0,
        totalComments: 0,
        totalReactions: 0,
        totalSubscribers: 0,
        topArticles: [],
        categoriesWithCount: [],
      },
    };
  }
}
