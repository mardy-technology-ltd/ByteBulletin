import { fetchWikipediaImage } from "../lib/utils/wikipedia";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "../lib/db/prisma";
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

async function fixMissingImages() {
  console.log("Starting missing image fix...");

  // Find articles that have an AI Summary but no image URL
  const articles = await prisma.article.findMany({
    where: {
      imageUrl: null,
      aiSummary: { isNot: null },
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
    }
  });

  console.log(`Found ${articles.length} articles needing images.`);

  for (const article of articles) {
    try {
      console.log(`\nProcessing: "${article.title}"`);
      
      // 1. Ask Gemini to extract the main entity keyword
      const prompt = `
        Analyze the following news article title and excerpt. 
        Identify the single primary named entity (person, team, company, event) to be used for a Wikipedia image search.
        Return ONLY the keyword, nothing else.

        Title: ${article.title}
        Excerpt: ${article.excerpt || ""}
      `;

      const { object: result } = await generateObject({
        model: google("gemini-flash-latest"),
        schema: z.object({
          keyword: z.string().describe("The primary named entity for Wikipedia search")
        }),
        prompt,
      });

      console.log(`Extracted keyword: ${result.keyword}`);

      // 2. Fetch image from Wikipedia
      if (result.keyword) {
        const imageUrl = await fetchWikipediaImage(result.keyword);
        
        if (imageUrl) {
          console.log(`Found image: ${imageUrl}`);
          
          // 3. Update database
          await prisma.article.update({
            where: { id: article.id },
            data: { imageUrl }
          });
          
          // Also update SEO metadata
          await prisma.seoMetadata.updateMany({
            where: { articleId: article.id },
            data: { ogImage: imageUrl }
          });
          
          console.log(`✅ Updated article ${article.id}`);
        } else {
          console.log(`❌ No image found on Wikipedia for keyword.`);
        }
      }
    } catch (error) {
      console.error(`Error processing article ${article.id}:`, error);
    }
    
    // 4. Rate Limit Protection (Wait 5 seconds between requests for Free Tier)
    console.log("Waiting 5 seconds to respect AI rate limits...");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log("\nFinished fixing images.");
  await prisma.$disconnect();
}

fixMissingImages().catch(console.error);
