import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { processArticleWithAI } from "@/lib/ai/process-article";
import { addCronLog } from "@/lib/ai/cron-logs";

export const maxDuration = 60; // 60 seconds max duration on Vercel
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
    addCronLog("info", "⏰ [CRON JOB STARTED] Background Cron Triggered from cron-job.org");
    
    // Find up to 2 articles that don't have an AI Summary yet
    const unprocessedArticles = await prisma.article.findMany({
      where: {
        aiSummary: null, // No summary exists
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 2,
    });

    if (unprocessedArticles.length === 0) {
      addCronLog("info", "ℹ️ No pending articles to process in this cycle.");
      return NextResponse.json({
        success: true,
        message: "No pending articles to process.",
      });
    }

    addCronLog("info", `Found ${unprocessedArticles.length} unprocessed articles for this cron batch.`);

    const results = [];
    let count = 0;
    const total = unprocessedArticles.length;
    
    // Process them sequentially to avoid hitting Gemini rate limits
    for (const article of unprocessedArticles) {
      count++;
      try {
        addCronLog("process", `[${count}/${total}] Processing article: ${article.title}`);
        const result = await processArticleWithAI(article.id);
        results.push({ id: article.id, status: "success", result });
        addCronLog("success", `[${count}/${total}] ✅ Success`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        addCronLog("error", `[${count}/${total}] ❌ Failed: ${errorMessage}`);
        results.push({ id: article.id, status: "failed", error: errorMessage });
      }
      
      // Artificial delay to respect rate limits if more than 1
      if (count < total) {
        addCronLog("wait", "Waiting 2 seconds for rate limits...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    addCronLog("info", `🏁 [CRON JOB COMPLETED] Successfully processed ${results.filter(r => r.status === 'success').length} articles.`);

    return NextResponse.json({
      success: true,
      message: `Processed ${unprocessedArticles.length} articles.`,
      details: results,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    addCronLog("error", `💥 [CRON ERROR] Processing cycle failed: ${errorMessage}`);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
