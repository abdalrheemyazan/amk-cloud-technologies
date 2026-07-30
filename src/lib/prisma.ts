import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { devPerfRecordQuery } from "./dev-perf";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const isDev = process.env.NODE_ENV === "development";

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
      // With a single pooled connection, concurrent queries (e.g. the Promise.all in
      // loadCustomerPortalData) queue for it one at a time. 2s wasn't enough headroom
      // for that queue plus a round trip and threw "timeout exceeded when trying to connect".
      connectionTimeoutMillis: 10000,
    });
    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({
      adapter,
      log: isDev ? ["error", "warn"] : ["error"],
    });
    if (!isDev) {
      return client;
    }
    // $on('query') doesn't reliably fire through the driver-adapter client in
    // Prisma 7, so the per-request query count / slowest-query summary used by
    // the [perf] logs is collected via a client extension instead.
    return client.$extends({
      query: {
        $allOperations: async ({ model, operation, args, query }) => {
          const startedAt = performance.now();
          const result = await query(args);
          devPerfRecordQuery(`${model ?? "raw"}.${operation}`, performance.now() - startedAt);
          return result;
        },
      },
    }) as unknown as PrismaClient;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("engine type \"client\" requires")) {
      return {} as PrismaClient;
    }
    throw error;
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

