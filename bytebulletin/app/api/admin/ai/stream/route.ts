import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { processArticleWithAI } from "@/lib/ai/gemini";

// Prevents Vercel from buffering the response
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Simple auth check (in a real app, use auth() from NextAuth to verify admin role)
  // We'll rely on the dashboard route being protected by NextAuth middleware.

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      function sendEvent(data: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        sendEvent({ type: "info", message: "Fetching all unprocessed articles..." });
        
        const unprocessedArticles = await prisma.article.findMany({
          where: {
            aiSummary: null, // No summary exists
          },
          orderBy: {
            publishedAt: 'desc'
          }
        });

        const total = unprocessedArticles.length;
        sendEvent({ type: "info", message: `Found ${total} articles to process.` });

        if (total === 0) {
          sendEvent({ type: "success", message: "🎉 All articles processed successfully!" });
          controller.close();
          return;
        }

        for (let i = 0; i < total; i++) {
          if (request.signal.aborted) {
            console.log("Client disconnected, stopping AI stream.");
            break;
          }
          
          const article = unprocessedArticles[i];
          const indexMsg = `[${i + 1}/${total}]`;
          
          sendEvent({ type: "process", message: `${indexMsg} Processing article: ${article.title}` });
          
          let success = false;
          let retries = 0;
          
          while (!success && retries < 3) {
            try {
              await processArticleWithAI(article.id);
              sendEvent({ type: "success", message: `${indexMsg} ✅ Success` });
              success = true;
            } catch (error: any) {
              const errMsg = error.message || String(error);
              if (
                errMsg.includes("Quota exceeded") || 
                errMsg.includes("429") || 
                errMsg.includes("retry in") ||
                errMsg.includes("Rate limit") ||
                errMsg.includes("try again in")
              ) {
                retries++;
                sendEvent({ type: "wait", message: `${indexMsg} ⚠️ Rate limit hit (TPM/RPM). Pausing 60s before retry ${retries}/3...` });
                await new Promise(resolve => setTimeout(resolve, 60000));
              } else {
                sendEvent({ type: "error", message: `${indexMsg} ❌ Failed: ${errMsg}` });
                break; // Break on non-quota errors
              }
            }
          }

          // Wait 8 seconds between requests to avoid Google Gemini Rate Limits
          if (i < total - 1) {
            sendEvent({ type: "wait", message: "Waiting 8 seconds for rate limits..." });
            await new Promise(resolve => setTimeout(resolve, 8000));
          }
        }

        sendEvent({ type: "success", message: "🎉 All articles processed successfully!" });
      } catch (error: any) {
        sendEvent({ type: "error", message: `Fatal Error: ${error.message}` });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
