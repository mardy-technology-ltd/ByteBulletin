import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch the 15 most recently processed AI Summaries directly from DB
    const summaries = await prisma.aISummary.findMany({
      take: 15,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            publishedAt: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    // Get total article stats
    const totalArticles = await prisma.article.count();
    const summarizedArticles = await prisma.article.count({
      where: { aiSummary: { isNot: null } },
    });

    const logs = summaries.map((s) => ({
      id: s.id,
      timestamp: new Date(s.createdAt).getTime(),
      formattedTime: new Date(s.createdAt).toLocaleTimeString(),
      title: s.article?.title || s.articleId,
      category: s.article?.category?.name || "General",
      model: s.model,
      summaryPreview: s.summary ? s.summary.substring(0, 100) + "..." : "",
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles,
        summarizedArticles,
        unsummarizedArticles: totalArticles - summarizedArticles,
      },
      summaries: logs,
    });
  } catch (error) {
    console.error("[AI Activity Endpoint Error]:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
