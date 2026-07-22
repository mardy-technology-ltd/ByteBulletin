import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatBdTime } from "@/lib/utils/format-time";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch recent 15 AI Summaries directly from DB
    const summaries = await prisma.aISummary.findMany({
      take: 15,
      orderBy: {
        generatedAt: "desc",
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

    // Get live metrics
    const [totalArticles, summarizedArticles, activeSources, totalUsers] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { aiSummary: { isNot: null } } }),
      prisma.source.count({ where: { isActive: true } }),
      prisma.user.count(),
    ]);

    const logs = summaries.map((s) => ({
      id: s.id,
      timestamp: s.generatedAt ? new Date(s.generatedAt).getTime() : Date.now(),
      formattedTime: formatBdTime(s.generatedAt),
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
        activeSources,
        totalUsers,
      },
      summaries: logs,
    });
  } catch (error) {
    console.error("[AI Activity Endpoint Error]:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
