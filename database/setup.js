import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../services/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    console.log('Starting database setup...');

    const RESET_TABLES = process.env.RESET_TABLES === 'true';

    try {
        if (RESET_TABLES) {
            console.log('Resetting tables...');
            await db.query('DROP TABLE IF EXISTS rate_limits CASCADE');
            await db.query('DROP TABLE IF EXISTS games CASCADE');
            await db.query('DROP TABLE IF EXISTS game_actions CASCADE');
            await db.query('DROP TABLE IF EXISTS submissions CASCADE');
            await db.query('DROP TABLE IF EXISTS challenges CASCADE');
            await db.query('DROP TABLE IF EXISTS api_keys CASCADE');
            console.log('All tables dropped successfully.');
        }

        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await db.query(sql);

        console.log('Database setup completed.');

        const res = await db.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = $1', ['public']);
        console.log('Tables in database:', res.rows.map(r => r.tablename).join(', '));
    } catch (error) {
        console.error('Database setup failed:', error.message);
        if (error.detail) console.error('Detail:', error.detail);
        process.exit(1);
    } finally {
        await db.pool.end();
    }
}

setupDatabase();
