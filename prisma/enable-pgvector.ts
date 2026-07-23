// One-off setup: enables the pgvector extension so `prisma db push` can create
// the `vector(768)` column on KnowledgeChunk. Supabase Postgres ships pgvector
// but it must be turned on per-database before the type exists.
//
// Run once with: npx tsx prisma/enable-pgvector.ts
import pg from "pg";

async function main() {
  const connectionString = (process.env.DATABASE_URL || "").replace(/[\?&]sslmode=[^&]+/g, "");
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS vector;");
    console.log("pgvector extension is enabled.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Failed to enable pgvector:", error);
  process.exit(1);
});
