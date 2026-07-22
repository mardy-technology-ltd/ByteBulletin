import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { getCronLogs } from "@/lib/ai/cron-logs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const since = parseInt(searchParams.get("since") || "0", 10);

    // Fetch cron logs generated after `since` timestamp
    const cronLogs = getCronLogs(since);

    // Fetch recent DB summaries as fallback
    const recentSummaries = await prisma.aISummary.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      logs: cronLogs,
      summaries: recentSummaries,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[AI Activity Endpoint Error]:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
