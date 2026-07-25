const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const slug = "the-hacker-who-humiliated-spyware-makers-and-was-never-caught-ahr0ch";
  
  const exact = await prisma.article.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true, status: true }
  });
  console.log("Exact findUnique:", exact);

  const articles = await prisma.article.findMany({
    take: 5,
    select: { slug: true, title: true, status: true }
  });
  console.log("Sample articles in DB:", articles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
