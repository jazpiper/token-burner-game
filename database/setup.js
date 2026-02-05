import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../services/db.js';
import { seedInitialChallenges } from '../services/challengeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    console.log('Starting database setup...');

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        // Split SQL by semicolon and filter out empty strings
        // Note: This is a simple splitter; doesn't handle semicolons inside strings
        // For schema.sql with DO blocks or functions, it's better to run it as one block
        // postgres pg.query handles multiple statements in one call if provided as a single string

        console.log('Executing schema.sql...');
        await db.query(sql);

        console.log('Database tables created successfully with compression optimization.');

        await seedInitialChallenges();

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
