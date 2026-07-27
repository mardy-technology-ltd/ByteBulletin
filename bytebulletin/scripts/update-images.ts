import { PrismaClient } from "@prisma/client";
import { extractKeywords } from "../lib/utils/string";

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { imageUrl: null },
        { imageUrl: "" }
      ]
    }
  });

  console.log(`Found ${articles.length} articles to update.`);

  for (const article of articles) {
    const keywords = extractKeywords(article.title);
    const newImage = `https://loremflickr.com/800/600/${keywords}`;
    await prisma.article.update({
      where: { id: article.id },
      data: { imageUrl: newImage }
    });
  }
  
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
