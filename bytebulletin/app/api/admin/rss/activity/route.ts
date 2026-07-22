import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatBdTime } from "@/lib/utils/format-time";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch recent 15 RssFetchLogs with source info
    const logs = await prisma.rssFetchLog.findMany({
      take: 15,
      orderBy: {
        fetchedAt: "desc",
      },
      include: {
        source: {
          select: {
            name: true,
            category: {
              select: {
                name: true,
              },
            },
            iconUrl: true,
          },
        },
      },
    });

    const formattedLogs = logs.map((l) => ({
      id: l.id,
      sourceName: l.source?.name || "Unknown Source",
      category: l.source?.category?.name || "General",
      status: l.status,
      articlesFound: l.articlesFound,
      articlesCreated: l.articlesCreated,
      durationMs: l.duration,
      formattedTime: formatBdTime(l.fetchedAt),
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
    });
  } catch (error) {
    console.error("[RSS Activity Endpoint Error]:", error);
    return NextResponse.json({ error: "Failed to fetch RSS activity" }, { status: 500 });
  }
}
