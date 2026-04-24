const { Client } = require('pg');
const connectionString = 'postgresql://postgres.xydadlktcksmgylfvurc:bancogonzalo2016%40@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkLogs() {
  await client.connect();
  const res = await client.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

checkLogs();
