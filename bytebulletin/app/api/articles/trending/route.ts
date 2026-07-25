import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const trendingArticles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      take: 5,
      orderBy: [
        { publishedAt: "desc" },
      ],
      include: {
        source: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, data: trendingArticles });
  } catch (error) {
    console.error("[GET /api/articles/trending] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending articles" },
      { status: 500 }
    );
  }
}
