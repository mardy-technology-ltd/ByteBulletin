import { prisma } from '../lib/db/prisma';

async function main() {
  console.log('Seeding database...');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: { name: 'Technology', slug: 'technology', description: 'Tech news' },
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: { name: 'Business', slug: 'business', description: 'Business news' },
    }),
    prisma.category.upsert({
      where: { slug: 'science' },
      update: {},
      create: { name: 'Science', slug: 'science', description: 'Science news' },
    }),
    prisma.category.upsert({
      where: { slug: 'health' },
      update: {},
      create: { name: 'Health', slug: 'health', description: 'Health news' },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: { name: 'Sports', slug: 'sports', description: 'Sports news' },
    }),
    prisma.category.upsert({
      where: { slug: 'world' },
      update: {},
      create: { name: 'World', slug: 'world', description: 'World news' },
    }),
  ]);

  console.log(`Created ${categories.length} categories.`);

  // Create Sources
  const techCrunch = await prisma.source.upsert({
    where: { slug: 'techcrunch' },
    update: {},
    create: {
      name: 'TechCrunch',
      slug: 'techcrunch',
      siteUrl: 'https://techcrunch.com',
      feedUrl: 'https://techcrunch.com/feed/',
      categoryId: categories.find(c => c.slug === 'technology')!.id,
    },
  });

  const theVerge = await prisma.source.upsert({
    where: { slug: 'the-verge' },
    update: {},
    create: {
      name: 'The Verge',
      slug: 'the-verge',
      siteUrl: 'https://www.theverge.com',
      feedUrl: 'https://www.theverge.com/rss/index.xml',
      categoryId: categories.find(c => c.slug === 'technology')!.id,
    },
  });

  console.log('Created sources: TechCrunch, The Verge.');

  // Create Mock Articles
  const article1 = await prisma.article.upsert({
    where: { slug: 'openai-announces-new-reasoning-models' },
    update: {},
    create: {
      title: 'OpenAI announces new reasoning models for ChatGPT',
      slug: 'openai-announces-new-reasoning-models',
      originalUrl: 'https://techcrunch.com/openai-reasoning',
      excerpt: 'OpenAI has announced a new series of AI models designed to spend more time thinking before they respond.',
      content: '<p>OpenAI has announced a new series of AI models designed to spend more time thinking before they respond. These models can reason through complex tasks and solve harder problems than previous models in science, coding, and math.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
      publishedAt: new Date(),
      status: 'PUBLISHED',
      sourceId: techCrunch.id,
      categoryId: categories.find(c => c.slug === 'technology')!.id,
      aiSummary: {
        create: {
          summary: 'OpenAI released a new reasoning model that can think before responding, improving its capabilities in complex tasks.',
          keyPoints: [
            'New reasoning models spend more time thinking before answering complex prompts.',
            'Outperforms previous architectures in complex math, coding benchmarks, and scientific analysis.',
            'Features improved chain-of-thought verification for higher accuracy.',
            'Available immediately to ChatGPT Plus and Team subscribers worldwide.',
            'Enterprise access rolling out with customized API rate limits.'
          ]
        }
      },
      seo: {
        create: {
          title: 'OpenAI announces new reasoning models for ChatGPT',
          description: 'OpenAI released a new reasoning model that can think before responding.',
          keywords: ['OpenAI', 'ChatGPT', 'AI', 'Reasoning']
        }
      }
    }
  });

  const article2 = await prisma.article.upsert({
    where: { slug: 'apple-event-2024-iphone-16' },
    update: {},
    create: {
      title: 'Apple event 2024: iPhone 16 Pro and all the announcements',
      slug: 'apple-event-2024-iphone-16',
      originalUrl: 'https://www.theverge.com/apple-event',
      excerpt: 'Apple has unveiled the iPhone 16 lineup alongside new Apple Watches and AirPods during its September event.',
      content: '<p>Apple has unveiled the iPhone 16 lineup alongside new Apple Watches and AirPods during its September event. The new iPhones feature a dedicated camera control button and larger displays on the Pro models.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1000&auto=format&fit=crop',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'PUBLISHED',
      sourceId: theVerge.id,
      categoryId: categories.find(c => c.slug === 'technology')!.id,
      aiSummary: {
        create: {
          summary: 'Apple announced the iPhone 16 series with a new camera button and larger screens for Pro models.',
          keyPoints: [
            'iPhone 16 and 16 Pro officially unveiled with A18 and A18 Pro Bionic chips.',
            'Introduces a new capacitive Camera Control button with tactile haptic feedback.',
            'Pro models expand screen sizes to 6.3-inch and 6.9-inch with ultra-thin bezels.',
            'Apple Watch Series 10 features a 30% larger wide-angle OLED display.',
            'AirPods 4 get active noise cancellation for the first time in an open-ear design.'
          ]
        }
      }
    }
  });

  const article3 = await prisma.article.upsert({
    where: { slug: 'google-tests-new-search-features' },
    update: {},
    create: {
      title: 'Google tests new search features with AI Overviews',
      slug: 'google-tests-new-search-features',
      originalUrl: 'https://techcrunch.com/google-ai-search',
      excerpt: 'Google is rolling out more AI features in Search, making it easier to find complex answers quickly.',
      content: '<p>Google is rolling out more AI features in Search, making it easier to find complex answers quickly. The new AI Overviews will now include links to sources directly within the text.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?q=80&w=1000&auto=format&fit=crop',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      status: 'PUBLISHED',
      sourceId: techCrunch.id,
      categoryId: categories.find(c => c.slug === 'technology')!.id,
      aiSummary: {
        create: {
          summary: 'Google is updating AI Overviews in Search to include inline links to sources.',
          keyPoints: [
            'Google Search AI Overviews receive prominent in-line publisher citation links.',
            'Designed to boost referral traffic back to original content creators.',
            'Tests show improved source verification and user engagement metrics.',
            'Global rollout starting in North America and expanding to international regions.'
          ]
        }
      }
    }
  });

  console.log('Created mock articles.');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
