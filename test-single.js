const { Client } = require('pg');

async function main() {
  const client = new Client({
    user: 'postgres.ksvcomlypdfsqikcnadn',
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    database: 'postgres',
    password: '211926746@@',
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting...");
    await client.connect();
    console.log("🎉 SUCCESS!");
    await client.end();
  } catch (err) {
    console.log("❌ FAILED:", err.message);
    try { await client.end(); } catch (e) {}
  }
}

main();
