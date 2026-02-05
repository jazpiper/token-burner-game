import pg from 'pg';
const { Pool } = pg;

/**
 * DB Connection Service
 * Uses manual config object to avoid string parsing issues with SSL
 */

let pool;

if (process.env.POSTGRES_URL) {
    // Explicit SSL configuration for production
    pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
}

/**
 * Basic query wrapper
 */
export async function query(text, params) {
    if (!pool) {
        throw new Error('Database not configured. Check POSTGRES_URL.');
    }

    try {
        return await pool.query(text, params);
    } catch (error) {
        // If it's a self-signed cert error, try to set the global flag as a fallback
        if (error.message.includes('self-signed certificate')) {
            console.warn('Handling self-signed cert error with global bypass...');
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            return await pool.query(text, params);
        }
        throw error;
    }
}

export async function getClient() {
    if (!pool) throw new Error('Database not configured');
    return await pool.connect();
}

export default {
    query,
    getClient,
    pool
};
