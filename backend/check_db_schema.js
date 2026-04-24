const { Client } = require('pg');
const connectionString = 'postgresql://postgres.xydadlktcksmgylfvurc:bancogonzalo2016%40@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  await client.connect();
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'users';");
  console.log('Columns in auth.users:', res.rows.map(r => r.column_name).join(', '));
  await client.end();
}

checkColumns();
