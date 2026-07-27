import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Simple header authorization check to prevent public abuse
  const authHeader = request.headers.get("authorization");
  
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Calculate the date for 1.5 months ago (approx 45 days)
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    // Delete articles older than 45 days
    // Because of onDelete: Cascade in Prisma schema, this will automatically delete 
    // related AISummaries, SeoMetadata, Comments, Bookmarks, and Reactions.
    const deletedArticles = await prisma.article.deleteMany({
      where: {
        publishedAt: {
          lt: fortyFiveDaysAgo,
        },
      },
    });

    console.log(`[Cron Cleanup] Successfully deleted ${deletedArticles.count} old articles.`);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedArticles.count} articles older than 45 days.`,
      deletedCount: deletedArticles.count,
    });
  } catch (error) {
    console.error("[Cron Cleanup] Error during article cleanup:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cleanup old articles." },
      { status: 500 }
    );
  }
}
