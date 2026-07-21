import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { AISentiment } from "@prisma/client";
import { fetchWikipediaImage } from "@/lib/utils/wikipedia";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// The strict JSON Schema for the AI output
const ArticleEnhancementSchema = z.object({
  summary: z.string().describe("A concise 2-3 sentence overview of the article."),
  keyPoints: z.array(z.string()).describe("An array of 3-5 critical bullet points."),
  seoTitle: z.string().describe("A click-optimized, highly searchable title under 60 characters."),
  metaDescription: z.string().describe("An SEO-optimized summary under 160 characters."),
  ogDescription: z.string().describe("An engaging description for social media sharing."),
  tags: z.array(z.string()).describe("3-5 contextually relevant tags as kebab-case strings."),
  keywords: z.array(z.string()).describe("High-value SEO keywords for indexing."),
  category: z.string().describe("The most relevant site category for this article (e.g., Technology, Business, Science, Health)."),
  slug: z.string().describe("A clean, URL-friendly slug based on the seoTitle."),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).describe("The overall sentiment of the article."),
  imageSearchKeyword: z.string().optional().describe("The primary named entity (person, team, company, event) in this article to be used for a Wikipedia image search."),
});

type ArticleEnhancement = z.infer<typeof ArticleEnhancementSchema>;

export async function processArticleWithAI(articleId: string) {
  // 1. Fetch the raw article and its source context
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { source: true },
  });

  if (!article) {
    throw new Error(`Article not found: ${articleId}`);
  }

  // Prevent re-processing
  const existingSummary = await prisma.aISummary.findUnique({
    where: { articleId: article.id },
  });
  if (existingSummary) {
    return { success: false, reason: "Already processed" };
  }

  // 2. Prepare the prompt context
  const prompt = `
    You are a senior technical editor and SEO expert.
    Analyze the following article from "${article.source.name}".
    
    Title: ${article.title}
    Content: ${article.content || article.excerpt}
    
    Generate the structured JSON enhancement data for this article following the exact schema provided.
  `;

  try {
    // 3. Call Google Gemini via AI SDK
    const { object: enhancement, usage } = await generateObject({
      model: google("gemini-flash-latest"),
      schema: ArticleEnhancementSchema,
      prompt: prompt,
      temperature: 0.2, // Low temperature for consistent formatting
    });

    // Fetch Wikipedia Image if no image exists
    let newImageUrl = article.imageUrl;
    if (!newImageUrl && enhancement.imageSearchKeyword) {
      const wikiImage = await fetchWikipediaImage(enhancement.imageSearchKeyword);
      if (wikiImage) {
        newImageUrl = wikiImage;
      }
    }

    // 4. Update the Database with the AI results
    await prisma.$transaction(async (tx) => {
      // Create AI Summary
      await tx.aISummary.create({
        data: {
          articleId: article.id,
          summary: enhancement.summary,
          keyPoints: enhancement.keyPoints,
          sentiment: enhancement.sentiment as AISentiment,
          model: "gemini-flash-latest",
          tokensUsed: usage.totalTokens,
        },
      });

      // Create SEO Metadata
      await tx.seoMetadata.upsert({
        where: { articleId: article.id },
        update: {
          title: enhancement.seoTitle,
          description: enhancement.metaDescription,
          ogImage: newImageUrl,
          keywords: enhancement.keywords,
        },
        create: {
          articleId: article.id,
          title: enhancement.seoTitle,
          description: enhancement.metaDescription,
          ogImage: newImageUrl,
          keywords: enhancement.keywords,
        },
      });

      // Update Article tags, slug, category, and possibly imageUrl
      await tx.article.update({
        where: { id: article.id },
        data: {
          slug: `${enhancement.slug}-${article.id.slice(-6)}`, // Ensure uniqueness
          imageUrl: newImageUrl,
          tags: {
            connectOrCreate: enhancement.tags.map(tag => ({
              where: { name: tag },
              create: { name: tag, slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
            })),
          },
        },
      });
    });

    return { success: true, enhancement };
  } catch (error) {
    console.error(`AI Processing failed for article ${articleId}:`, error);
    throw error;
  }
}
