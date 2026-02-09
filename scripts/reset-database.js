import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log('Starting database reset...');

    // Drop all tables and views
    console.log('Dropping existing tables and views...');
    await client.query('DROP MATERIALIZED VIEW IF EXISTS leaderboard_mv CASCADE');
    await client.query('DROP TABLE IF EXISTS rate_limits CASCADE');
    await client.query('DROP TABLE IF EXISTS game_actions CASCADE');
    await client.query('DROP TABLE IF EXISTS games CASCADE');
    await client.query('DROP TABLE IF EXISTS submissions CASCADE');
    await client.query('DROP TABLE IF EXISTS challenges CASCADE');
    await client.query('DROP TABLE IF EXISTS api_keys CASCADE');
    console.log('✓ Dropped all tables');

    // Read and execute schema.sql
    console.log('Creating tables from schema.sql...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (err) {
          // Ignore errors for IF NOT EXISTS statements
          if (!err.message.includes('already exists')) {
            console.error('Error executing statement:', err.message);
            console.error('Statement:', statement.substring(0, 100));
          }
        }
      }
    }

    console.log('✓ Created all tables');

    // Verify challenges were inserted
    const result = await client.query('SELECT COUNT(*) FROM challenges');
    console.log(`✓ Inserted ${result.rows[0].count} challenges`);

    // Verify materialized view was created
    const mvResult = await client.query("SELECT COUNT(*) FROM leaderboard_mv");
    console.log(`✓ Materialized view created with ${mvResult.rows[0].count} rows`);

    console.log('\n✅ Database reset completed successfully!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase().catch(console.error);
