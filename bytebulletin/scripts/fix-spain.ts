import { fetchWikipediaImage } from "../lib/utils/wikipedia";
import { prisma } from "../lib/db/prisma";

async function fixSpecificArticle() {
  try {
    const article = await prisma.article.findFirst({
      where: {
        title: {
          contains: "Spain's World Cup champions"
        }
      }
    });

    if (article) {
      console.log(`Found article: ${article.title}`);
      
      const imageUrl = await fetchWikipediaImage("Spain women's national football team");
      
      if (imageUrl) {
         console.log(`Found image: ${imageUrl}`);
         await prisma.article.update({
            where: { id: article.id },
            data: { imageUrl }
         });
         console.log("Updated specific article successfully!");
      }
    } else {
      console.log("Article not found.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSpecificArticle();
