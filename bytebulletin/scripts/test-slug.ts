import { prisma } from "../lib/db/prisma";

async function main() {
  const slug = "the-hacker-who-humiliated-spyware-makers-and-was-never-caught-ahr0ch";
  const article = await prisma.article.findFirst({
    where: {
      OR: [
        { slug: slug },
        { slug: { contains: "hacker", mode: "insensitive" } }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
    }
  });

  console.log("Found article:", JSON.stringify(article, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
