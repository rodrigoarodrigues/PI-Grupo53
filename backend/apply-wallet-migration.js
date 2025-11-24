import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('📦 Aplicando migration 0002_add_wallet_and_price.sql...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'drizzle', '0002_add_wallet_and_price.sql'),
      'utf8'
    );
    
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Migration aplicada com sucesso!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao aplicar migration:', error);
    
    // Se o erro for porque a coluna já existe, apenas avisar
    if (error.message && error.message.includes('already exists')) {
      console.log('ℹ️  Colunas já existem no banco de dados.');
    } else {
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration().catch(console.error);

