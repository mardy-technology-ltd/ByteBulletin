import { prisma } from './lib/db/prisma';
import { processArticleWithAI } from './lib/ai/gemini';

async function main() {
  console.log('Fetching all unprocessed articles...');
  
  const unprocessedArticles = await prisma.article.findMany({
    where: {
      aiSummary: null, // No summary exists
    },
    orderBy: {
      publishedAt: 'desc'
    }
  });

  console.log(`Found ${unprocessedArticles.length} articles to process.`);

  for (let i = 0; i < unprocessedArticles.length; i++) {
    const article = unprocessedArticles[i];
    console.log(`[${i + 1}/${unprocessedArticles.length}] Processing article: ${article.title}`);
    
    let success = false;
    let retries = 0;

    while (!success && retries < 3) {
      try {
        await processArticleWithAI(article.id);
        console.log(`✅ Success`);
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
          console.log(`⚠️ Rate limit hit (TPM/RPM). Pausing 60s before retry ${retries}/3...`);
          await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
          console.error(`❌ Failed:`, errMsg);
          break; // Break on non-quota errors
        }
      }
    }

    // Wait 8 seconds between requests to avoid Google Gemini Rate Limits
    if (i < unprocessedArticles.length - 1) {
      console.log('Waiting 8 seconds for rate limits...');
      await new Promise(resolve => setTimeout(resolve, 8000));
    }
  }

  console.log('🎉 All articles processed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
