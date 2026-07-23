import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// ─────────────────────────────────────────────────────────────
// Production-Grade Prisma Client Singleton with Serverless Pool Safety
// Prevents Supabase (EMAXCONNSESSION) session pool exhaustion
// ─────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    max: 2, // Strict limit per worker to stay within Supabase session pool limit
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
