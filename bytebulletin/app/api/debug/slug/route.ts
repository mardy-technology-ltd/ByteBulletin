import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// TEMPORARY DEBUG ENDPOINT - Remove after diagnosis
// Usage: /api/debug/slug?q=warner-bros  OR  /api/debug/slug?exact=warner-bros-...-ahr0ch
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const exact = searchParams.get("exact") || "";

    let exactResult = null;
    let containsResults: any[] = [];
    let totalCount = 0;

    // 1. Try exact slug match
    if (exact) {
      exactResult = await prisma.article.findUnique({
        where: { slug: exact },
        select: { id: true, title: true, slug: true, status: true, publishedAt: true },
      });
    }

    // 2. Try contains search (using the q param as keyword)
    if (q) {
      containsResults = await prisma.article.findMany({
        where: {
          slug: { contains: q },
        },
        select: { id: true, title: true, slug: true, status: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 10,
      });
    }

    // 3. Total published article count
    totalCount = await prisma.article.count({
      where: { status: "PUBLISHED" },
    });

    return NextResponse.json({
      ok: true,
      diagnostics: {
        exactSlugQueried: exact || null,
        exactMatch: exactResult,
        keywordQueried: q || null,
        containsMatches: containsResults,
        totalPublishedArticles: totalCount,
        message: exactResult
          ? "✅ Article found by exact slug"
          : containsResults.length > 0
          ? "⚠️ Article NOT found by exact slug, but similar slugs exist"
          : "❌ No matching articles found in DB",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "DB connection or query error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
