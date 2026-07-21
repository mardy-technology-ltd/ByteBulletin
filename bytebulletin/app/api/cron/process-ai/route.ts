import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { processArticleWithAI } from "@/lib/ai/gemini";
import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[AI Cron] Starting AI processing cycle...");
    
    // Find up to 5 articles that don't have an AI Summary yet
    const unprocessedArticles = await prisma.article.findMany({
      where: {
        aiSummary: null, // No summary exists
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 5,
    });

    if (unprocessedArticles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending articles to process.",
      });
    }

    const results = [];
    
    // Process them sequentially to avoid hitting Gemini rate limits (e.g. 15 RPM for free tier)
    for (const article of unprocessedArticles) {
      try {
        console.log(`[AI Cron] Processing article: ${article.id}`);
        const result = await processArticleWithAI(article.id);
        results.push({ id: article.id, status: "success", result });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`[AI Cron] Failed to process article ${article.id}:`, errorMessage);
        results.push({ id: article.id, status: "failed", error: errorMessage });
      }
      
      // Artificial delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Invalidate caches
    // revalidateTag("articles");

    return NextResponse.json({
      success: true,
      message: `Processed ${unprocessedArticles.length} articles.`,
      details: results,
    });
  } catch (error: unknown) {
    console.error("[AI Cron] Processing cycle failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
