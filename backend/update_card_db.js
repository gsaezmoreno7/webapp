const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.xydadlktcksmgylfvurc',
  password: 'bancogonzalo2016@',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    // Añadimos el estado de la tarjeta y una columna para la fecha de reposición si fuera necesario
    await client.query(`
      ALTER TABLE accounts 
      ADD COLUMN IF NOT EXISTS card_status TEXT DEFAULT 'active' 
      CHECK (card_status IN ('active', 'blocked', 'requested'));
    `);
    console.log('✅ Base de datos actualizada con éxito.');
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}
run();
