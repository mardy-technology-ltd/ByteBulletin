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

function getConnectionString(): string {
  let url = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  if (!url) return "";
  if (url.includes(":6543") && !url.includes("connection_limit=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connection_limit=1`;
  }
  return url;
}

function createPrismaClient(): PrismaClient {
  const connectionString = getConnectionString();
  const pool = new Pool({
    connectionString,
    max: 1, // Single connection per serverless lambda prevents pool exhaustion
    idleTimeoutMillis: 1000, // Release connection slot back to Supabase pooler immediately
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
