require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

async function main() {
  console.log("Starting database connection test...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  
  const connectionString = process.env.DATABASE_URL?.replace("?sslmode=require", "").replace("&sslmode=require", "");
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({
    adapter,
    log: ["error"]
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log("Success! Query result:", result);
  } catch (error) {
    console.error("Connection failed with error:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
