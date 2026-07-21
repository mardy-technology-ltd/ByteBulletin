import { prisma } from './lib/db/prisma';

async function main() {
  console.log('Deleting all dummy data...');
  
  await prisma.aISummary.deleteMany({});
  await prisma.seoMetadata.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.article.deleteMany({});

  console.log('All articles deleted.');
  
  // Also create a new real RSS source
  const techCategory = await prisma.category.findUnique({ where: { slug: 'technology' } });
  
  if (techCategory) {
    await prisma.source.upsert({
      where: { slug: 'google-news-tech' },
      update: {},
      create: {
        name: 'Google News - Technology',
        slug: 'google-news-tech',
        siteUrl: 'https://news.google.com',
        feedUrl: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
        categoryId: techCategory.id,
      },
    });
    console.log('Added Google News RSS source.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
