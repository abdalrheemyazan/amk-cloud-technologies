import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  try {
    let connectionString = process.env.DATABASE_URL || "";
    // Strip sslmode from the URL so pg-connection-string doesn't override our manual ssl config
    connectionString = connectionString.replace(/[\?&]sslmode=[^&]+/g, "");
    
    const pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch (error: any) {
    // If running in an environment that Next.js treats as Edge during build, just return a dummy
    if (error?.message?.includes("engine type \"client\" requires")) {
      console.warn("Prisma edge environment detected during build, using mock.");
      return {} as PrismaClient;
    }
    throw error;
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
