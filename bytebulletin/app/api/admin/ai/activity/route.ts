import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the 10 most recently created/updated AI Summaries
    const recentSummaries = await prisma.aISummary.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            publishedAt: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: recentSummaries,
    });
  } catch (error) {
    console.error("[AI Activity Endpoint Error]:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
