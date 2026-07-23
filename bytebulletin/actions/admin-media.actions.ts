"use server";

import { prisma } from "@/lib/db/prisma";

export async function getAdminMediaData(page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;

    const [articlesWithImage, totalCount] = await Promise.all([
      prisma.article.findMany({
        where: { imageUrl: { not: null } },
        take: limit,
        skip,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          publishedAt: true,
          source: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.article.count({ where: { imageUrl: { not: null } } }),
    ]);

    return {
      success: true,
      articlesWithImage,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("[getAdminMediaData Error]:", error);
    return {
      success: false,
      articlesWithImage: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}
