import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// TEMPORARY DEBUG ENDPOINT - Remove after diagnosis
// ping (no DB): /api/debug/slug?ping=1
// search by keyword: /api/debug/slug?q=warner-bros
// search by exact slug: /api/debug/slug?exact=warner-bros-...-ahr0ch
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ping = searchParams.get("ping");

  // Simple ping test - no DB needed
  if (ping) {
    return NextResponse.json({ ok: true, pong: true, ts: Date.now() });
  }

  const q = searchParams.get("q") || "";
  const exact = searchParams.get("exact") || "";

  try {
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

    // 2. Try contains search
    if (q) {
      containsResults = await prisma.article.findMany({
        where: { slug: { contains: q } },
        select: { id: true, title: true, slug: true, status: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 10,
      });
    }

    // 3. Total published article count
    totalCount = await prisma.article.count({ where: { status: "PUBLISHED" } });

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
      { ok: false, error: error?.message || "DB error" },
      { status: 500 }
    );
  }
}
