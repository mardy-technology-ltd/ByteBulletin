import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // TEMP: Debug mode - find articles by slug keyword
  // Usage: /api/articles/trending?debugSlug=warner-bros
  const debugSlug = searchParams.get("debugSlug");
  if (debugSlug) {
    try {
      const total = await prisma.article.count({ where: { status: "PUBLISHED" } });
      const matches = await prisma.article.findMany({
        where: { slug: { contains: debugSlug } },
        select: { id: true, title: true, slug: true, status: true },
        take: 10,
      });
      return NextResponse.json({
        debug: true,
        totalPublished: total,
        matches,
        msg: matches.length > 0 ? "Found" : "Not found",
      });
    } catch (e: any) {
      return NextResponse.json({ debug: true, error: e.message }, { status: 500 });
    }
  }

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
