import { NextResponse } from "next/server";
import { ingestDueSources } from "@/lib/rss/ingester";
import { revalidateTag } from "next/cache";

// Recommended: Secure the endpoint with a secret matching Vercel Cron config
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  // Basic security check to prevent abuse
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting RSS ingestion cycle...");
    const results = await ingestDueSources();
    
    // Invalidate Next.js cache so the homepage and categories show new articles instantly
    if (results.some(r => r.articlesCreated > 0)) {
      // revalidateTag("articles");
    }

    return NextResponse.json({
      success: true,
      message: `Ingestion cycle complete. Processed ${results.length} sources.`,
      details: results,
    });
  } catch (error: unknown) {
    console.error("[Cron] Ingestion cycle failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
