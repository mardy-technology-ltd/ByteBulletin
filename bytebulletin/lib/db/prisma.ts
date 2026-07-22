import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// ─────────────────────────────────────────────────────────────
// Prisma Client Dynamic Proxy Singleton
// Ensures automatic model refresh during development HMR
// ─────────────────────────────────────────────────────────────

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  let DynamicPrismaClient = PrismaClient;
  try {
    if (typeof require !== "undefined" && require.cache) {
      Object.keys(require.cache).forEach((key) => {
        if (key.includes("@prisma") || key.includes(".prisma")) {
          delete require.cache[key];
        }
      });
      DynamicPrismaClient = require("@prisma/client").PrismaClient || PrismaClient;
    }
  } catch (e) {
    console.warn("[Prisma Dynamic Reload Warning]:", e);
  }

  return new DynamicPrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

function getPrismaInstance(): PrismaClient {
  const gPrisma = (globalThis as any).prisma;
  if (!gPrisma || !gPrisma.articleReaction || !gPrisma.comment) {
    const client = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      (globalThis as any).prisma = client;
    }
    return client;
  }
  return gPrisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getPrismaInstance() as any;
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
