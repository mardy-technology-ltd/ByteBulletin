import { prisma } from './lib/db/prisma';

async function main() {
  console.log('Adding more Google News sources...');
  
  const sources = [
    { slug: 'business', name: 'Google News - Business', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en' },
    { slug: 'science', name: 'Google News - Science', url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en' },
    { slug: 'health', name: 'Google News - Health', url: 'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en' },
    { slug: 'sports', name: 'Google News - Sports', url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en' },
    { slug: 'world', name: 'Google News - World', url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en' },
  ];

  for (const s of sources) {
    const category = await prisma.category.findUnique({ where: { slug: s.slug } });
    if (category) {
      await prisma.source.upsert({
        where: { slug: `google-news-${s.slug}` },
        update: {},
        create: {
          name: s.name,
          slug: `google-news-${s.slug}`,
          siteUrl: 'https://news.google.com',
          feedUrl: s.url,
          categoryId: category.id,
        },
      });
      console.log(`Added source for ${s.name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
