import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const createPrismaClient = () => {
  try {
    let connectionString = process.env.DATABASE_URL || "";
    connectionString = connectionString.replace(/[\?&]sslmode=[^&]+/g, "");
    
    // In serverless, limit pool size to 1-2 per instance to avoid EMAXCONNSESSION
    const pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 1, // Fix EMAXCONNSESSION
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 2000,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch (error: any) {
    if (error?.message?.includes("engine type \"client\" requires")) {
      return {} as PrismaClient;
    }
    throw error;
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

