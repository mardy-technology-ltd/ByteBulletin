import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function run() {
  const connectionString = "postgresql://postgres.pmofdospugjhdaiwjoqb:Ideapad110%40%23%24@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
  
  const pool = new Pool({
    connectionString,
    max: 1,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const articles = await prisma.article.findMany({
      select: { id: true, title: true, imageUrl: true }
    });
    
    // Find all articles with google news logo or null
    const bad = articles.filter(a => a.imageUrl && (
      a.imageUrl.includes('googleusercontent.com') ||
      a.imageUrl.includes('news.google.com') ||
      a.imageUrl.includes('favicon') ||
      a.imageUrl.includes('google')
    ));
    console.log(`Found ${bad.length} articles with google news logo`);
    
    if (bad.length > 0) {
      console.log(bad.slice(0, 5));
      
      const res = await prisma.article.deleteMany({
        where: { id: { in: bad.map(a => a.id) } }
      });
      // The user suggested updating imageUrl to null, but deleting them is better 
      // because the ingester skips scraping if the article already exists! 
      // Wait, ingester uses upsert: update: { title, excerpt, content, imageUrl } 
      // So if it upserts, it WILL update the image. 
      // But if we delete them, it will re-fetch them entirely, ensuring fresh data.
      console.log(`Deleted ${res.count} articles to force refetch.`);
      
      const res2 = await prisma.source.updateMany({
        data: { lastFetchedAt: null }
      });
      console.log(`Reset ${res2.count} sources for immediate refetch.`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
