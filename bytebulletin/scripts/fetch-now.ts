import { ingestDueSources } from "../lib/rss/ingester";
import { prisma } from "../lib/db/prisma";

async function main() {
  console.log("Starting manual RSS ingestion...");
  try {
    const results = await ingestDueSources();
    console.log("Ingestion Results:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error during ingestion:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
