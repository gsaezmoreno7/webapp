const { Client } = require('pg');

const connectionString = 'postgresql://postgres.xydadlktcksmgylfvurc:bancogonzalo2016%40@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixDatabase() {
  try {
    console.log('--- INICIANDO REPARACIÓN DE BASE DE DATOS ---');
    await client.connect();
    console.log('Conectado a Supabase...');

    // Crear la columna card_status
    await client.query(`
      ALTER TABLE accounts 
      ADD COLUMN IF NOT EXISTS card_status TEXT DEFAULT 'active' 
      CHECK (card_status IN ('active', 'blocked', 'requested'));
    `);
    
    console.log('✅ COLUMNA card_status: Creada/Verificada.');
    
    // Verificar que la columna existe
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'card_status';");
    if (res.rows.length > 0) {
      console.log('✅ VERIFICACIÓN: La columna ahora existe físicamente.');
    } else {
      console.log('❌ ERROR: No se pudo crear la columna.');
    }

    await client.end();
    console.log('--- REPARACIÓN FINALIZADA ---');
  } catch (err) {
    console.error('❌ ERROR FATAL:', err.message);
    process.exit(1);
  }
}

fixDatabase();
