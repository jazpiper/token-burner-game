import pg from 'pg';
const { Pool } = pg;

// Use POSTGRES_URL environment variable
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.warn('POSTGRES_URL environment variable is not defined. Database features will be disabled.');
}

const pool = new Pool({
    connectionString,
    ssl: connectionString ? { rejectUnauthorized: false } : false
});

/**
 * Basic query wrapper with error handling
 */
export async function query(text, params) {
    if (!connectionString) {
        throw new Error('Database connection string not configured');
    }

    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        // console.log('executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Transaction wrapper
 */
export async function getClient() {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);

    return { client, query, release };
}

export default {
    query,
    getClient,
    pool
};
