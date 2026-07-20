import { PrismaClient } from "@prisma/client";
import { defaultCategories } from "../config/categories";
import { slugify } from "../lib/utils/slug";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ByteBulletin database...\n");

  // ── 1. Categories ──────────────────────────────────────────
  console.log("  → Seeding categories...");
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
      },
    });
  }
  console.log(`  ✓ ${defaultCategories.length} categories seeded\n`);

  // ── 2. Sample Admin User ────────────────────────────────────
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash("Admin@123456", 12);

  console.log("  → Seeding admin user...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@bytebulletin.com" },
    update: {},
    create: {
      name: "ByteBulletin Admin",
      email: "admin@bytebulletin.com",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // Create admin preferences
  await prisma.userPreference.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });
  console.log("  ✓ Admin user seeded (admin@bytebulletin.com / Admin@123456)\n");

  // ── 3. Sample RSS Sources ───────────────────────────────────
  console.log("  → Seeding sample sources...");

  const techCategory = await prisma.category.findUnique({
    where: { slug: "technology" },
  });
  const scienceCategory = await prisma.category.findUnique({
    where: { slug: "science" },
  });
  const businessCategory = await prisma.category.findUnique({
    where: { slug: "business" },
  });

  const sampleSources = [
    {
      name: "TechCrunch",
      feedUrl: "https://techcrunch.com/feed/",
      siteUrl: "https://techcrunch.com",
      categoryId: techCategory!.id,
    },
    {
      name: "The Verge",
      feedUrl: "https://www.theverge.com/rss/index.xml",
      siteUrl: "https://www.theverge.com",
      categoryId: techCategory!.id,
    },
    {
      name: "Wired",
      feedUrl: "https://www.wired.com/feed/rss",
      siteUrl: "https://www.wired.com",
      categoryId: techCategory!.id,
    },
    {
      name: "BBC Science",
      feedUrl: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
      siteUrl: "https://www.bbc.com/news/science_and_environment",
      categoryId: scienceCategory!.id,
    },
    {
      name: "Reuters Business",
      feedUrl: "https://feeds.reuters.com/reuters/businessNews",
      siteUrl: "https://www.reuters.com/business/",
      categoryId: businessCategory!.id,
    },
  ];

  for (const source of sampleSources) {
    const slug = slugify(source.name);
    await prisma.source.upsert({
      where: { slug },
      update: {},
      create: {
        name: source.name,
        slug,
        feedUrl: source.feedUrl,
        siteUrl: source.siteUrl,
        categoryId: source.categoryId,
        fetchInterval: 30,
      },
    });
  }
  console.log(`  ✓ ${sampleSources.length} sample sources seeded\n`);

  console.log("✅ Database seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
