const { Client } = require('pg');

const tests = [
  // 1. Direct host, username: postgres
  {
    host: 'db.ksvcomlypdfsqikcnadn.supabase.co',
    username: 'postgres',
    port: 5432,
    passwords: ['211926746@@', '211926746@', '211926746@@@', '211926746']
  },
  // 2. Pooler host, username: postgres.ksvcomlypdfsqikcnadn
  {
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    username: 'postgres.ksvcomlypdfsqikcnadn',
    port: 5432,
    passwords: ['211926746@@', '211926746@', '211926746@@@', '211926746']
  },
  // 3. Pooler host, transaction port 6543
  {
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    username: 'postgres.ksvcomlypdfsqikcnadn',
    port: 6543,
    passwords: ['211926746@@', '211926746@', '211926746@@@', '211926746']
  }
];

async function testConfig(host, username, port, password) {
  console.log(`\nTesting: host=${host}, user=${username}, port=${port}, pwd="${password}"...`);
  const client = new Client({
    user: username,
    host: host,
    database: 'postgres',
    password: password,
    port: port,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`🎉 SUCCESS! Connected successfully!`);
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    try {
      await client.end();
    } catch (e) {}
    return false;
  }
}

async function runAll() {
  for (const t of tests) {
    for (const pwd of t.passwords) {
      const success = await testConfig(t.host, t.username, t.port, pwd);
      if (success) {
        console.log('\n🌟 Found working combination!');
        console.log(`Host: ${t.host}`);
        console.log(`User: ${t.username}`);
        console.log(`Port: ${t.port}`);
        console.log(`Password: ${pwd}`);
        process.exit(0);
      }
    }
  }
  console.log('\n😞 None of the combinations succeeded.');
}

runAll();
