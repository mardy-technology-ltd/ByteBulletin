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
    
    try {
      await processArticleWithAI(article.id);
      console.log(`✅ Success`);
    } catch (error) {
      console.error(`❌ Failed:`, error instanceof Error ? error.message : error);
    }

    // Wait 4 seconds between requests to avoid Google Gemini Rate Limits (15 RPM for free tier)
    if (i < unprocessedArticles.length - 1) {
      console.log('Waiting 4 seconds for rate limits...');
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }

  console.log('🎉 All articles processed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
