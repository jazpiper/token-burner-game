import oracledb from 'oracledb';

/**
 * Oracle DB Connection Service
 * Uses oracledb with connection pooling for Autonomous Database
 * Provides PostgreSQL-compatible interface
 */

let pool = null;
let poolPromise = null;

/**
 * Initialize Oracle DB connection pool
 */
async function initPool() {
    if (pool) {
        return pool;
    }

    if (poolPromise) {
        return poolPromise;
    }

    poolPromise = (async () => {
        const {
            ORACLE_USER,
            ORACLE_PASSWORD,
            ORACLE_CONNECTION_STRING
        } = process.env;

        if (!ORACLE_USER || !ORACLE_PASSWORD || !ORACLE_CONNECTION_STRING) {
            throw new Error('Oracle DB credentials not configured. Check ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECTION_STRING.');
        }

        // Create connection pool (SSL context configured in connection string)
        pool = await oracledb.createPool({
            user: ORACLE_USER,
            password: ORACLE_PASSWORD,
            connectionString: ORACLE_CONNECTION_STRING,
            poolMin: 1,
            poolMax: 10,
            poolIncrement: 1,
            poolTimeout: 60,
            stmtCacheSize: 23
        });

        console.log('✅ Oracle DB connection pool created');
        return pool;
    })();

    return poolPromise;
}

/**
 * Convert PostgreSQL SQL to Oracle SQL
 */
function convertSQL(sql) {
    // Replace $1, $2 with :1, :2 FIRST (before LIMIT/OFFSET handling)
    sql = sql.replace(/\$(\d+)/g, ':$1');

    // Handle LIMIT/OFFSET with bind parameters
    const limitOffsetMatch = sql.match(/LIMIT\s+:(\d+)\s+OFFSET\s+:(\d+)/i);
    if (limitOffsetMatch) {
        const offsetParam = ':' + limitOffsetMatch[2];
        const limitParam = ':' + limitOffsetMatch[1];
        sql = sql.replace(/LIMIT\s+:\d+\s+OFFSET\s+:\d+/i, `OFFSET ${offsetParam} ROWS FETCH NEXT ${limitParam} ROWS ONLY`);
    } else {
        // Handle LIMIT only (no OFFSET)
        const limitOnlyMatch = sql.match(/LIMIT\s+:(\d+)/i);
        if (limitOnlyMatch) {
            const limitParam = ':' + limitOnlyMatch[1];
            sql = sql.replace(/LIMIT\s+:\d+/i, `OFFSET 0 ROWS FETCH NEXT ${limitParam} ROWS ONLY`);
        }
    }

    // Also handle literal values (for direct SQL)
    const literalLimitOffsetMatch = sql.match(/LIMIT\s+(\d+)\s+OFFSET\s+(\d+)/i);
    if (literalLimitOffsetMatch) {
        const offset = parseInt(literalLimitOffsetMatch[2]);
        const limit = parseInt(literalLimitOffsetMatch[1]);
        sql = sql.replace(/LIMIT\s+\d+\s+OFFSET\s+\d+/i, `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`);
    } else if (/LIMIT\s+(\d+)/i.test(sql)) {
        const literalLimitMatch = sql.match(/LIMIT\s+(\d+)/i);
        const limit = parseInt(literalLimitMatch[1]);
        // Oracle requires OFFSET with FETCH NEXT
        sql = sql.replace(/LIMIT\s+\d+/i, `OFFSET 0 ROWS FETCH NEXT ${limit} ROWS ONLY`);
    }

    // Replace CURRENT_TIMESTAMP with SYSTIMESTAMP (both work in Oracle, but SYSTIMESTAMP is more common)
    sql = sql.replace(/CURRENT_TIMESTAMP/g, 'SYSTIMESTAMP');

    return sql;
}

/**
 * Query wrapper - compatible interface with PostgreSQL
 */
export async function query(text, params = []) {
    const pool = await initPool();

    let connection;
    try {
        connection = await pool.getConnection();

        // Convert SQL to Oracle syntax
        const oracleSql = convertSQL(text);

        // Prepare bind params - empty object is fine for no params
        const bindParams = {};
        if (params && params.length > 0) {
            params.forEach((param, index) => {
                bindParams[index + 1] = param;
            });
        }

        const result = await connection.execute(
            oracleSql,
            bindParams,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Explicitly commit for INSERT/UPDATE/DELETE queries
        // Check if the SQL is a modifying query (not SELECT)
        const upperSql = oracleSql.trim().toUpperCase();
        const isModifyingQuery = upperSql.startsWith('INSERT') ||
                                 upperSql.startsWith('UPDATE') ||
                                 upperSql.startsWith('DELETE') ||
                                 upperSql.startsWith('MERGE');

        if (isModifyingQuery && result.rowsAffected > 0) {
            await connection.commit();
        }

        // Convert Oracle result to PostgreSQL-like format (async for CLOB handling)
        // Handle case where result.rows is undefined (e.g., for INSERT/UPDATE/DELETE)
        const rows = result.rows ? await Promise.all(result.rows.map(async row => {
            const converted = {};
            for (const [key, value] of Object.entries(row)) {
                // Oracle returns uppercase column names, convert to lowercase for PostgreSQL compatibility
                const lowerKey = key.toLowerCase();
                // Handle CLOB - convert to string
                if (value && typeof value === 'object') {
                    if (value.constructor?.name === 'Lob') {
                        // Convert CLOB to string
                        try {
                            converted[lowerKey] = value && typeof value.getData === 'function'
                                ? await value.getData()
                                : null;
                        } catch (e) {
                            converted[lowerKey] = null;
                        }
                    } else {
                        converted[lowerKey] = value;
                    }
                } else {
                    converted[lowerKey] = value;
                }
            }
            return converted;
        })) : [];

        return {
            rows: rows,
            rowCount: result.rowsAffected,
            rowsAffected: result.rowsAffected
        };
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

/**
 * Get a connection from the pool for transactions
 */
export async function getClient() {
    const pool = await initPool();
    const connection = await pool.getConnection();

    // Auto-commit is disabled by default when getting connection for transactions
    // Note: ALTER SESSION requires additional privileges, so we skip it
    await connection.execute(`ALTER SESSION SET COMMIT_LOGGING = 'IMMEDIATE'`).catch(() => {
        // Ignore error if ALTER SESSION privilege not available
    });

    let inTransaction = false;

    const wrappedClient = {
        conn: connection,

        async query(text, params = []) {
            const oracleSql = convertSQL(text);

            // Prepare bind params - only if params exist
            let bindParams = undefined;
            if (params && params.length > 0) {
                bindParams = {};
                params.forEach((param, index) => {
                    bindParams[index + 1] = param;
                });
            }

            // Handle transaction commands
            const upperText = text.trim().toUpperCase();

            if (upperText === 'BEGIN') {
                inTransaction = true;
                // Oracle doesn't need explicit BEGIN, starts transaction implicitly
                return { rows: [], rowCount: 0, rowsAffected: 0 };
            }

            if (upperText === 'COMMIT') {
                await connection.commit();
                inTransaction = false;
                return { rows: [], rowCount: 0, rowsAffected: 0 };
            }

            if (upperText === 'ROLLBACK') {
                await connection.rollback();
                inTransaction = false;
                return { rows: [], rowCount: 0, rowsAffected: 0 };
            }

            const result = await connection.execute(
                oracleSql,
                bindParams,
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            // Handle case where result.rows is undefined (e.g., for INSERT/UPDATE/DELETE)
            const rows = result.rows ? await Promise.all(result.rows.map(async row => {
                const converted = {};
                for (const [key, value] of Object.entries(row)) {
                    // Convert to lowercase for PostgreSQL compatibility
                    const lowerKey = key.toLowerCase();
                    if (value && typeof value === 'object') {
                        if (value.constructor?.name === 'Lob') {
                            // Convert CLOB to string
                            try {
                                converted[lowerKey] = value && typeof value.getData === 'function'
                                    ? await value.getData()
                                    : null;
                            } catch (e) {
                                converted[lowerKey] = null;
                            }
                        } else {
                            converted[lowerKey] = value;
                        }
                    } else {
                        converted[lowerKey] = value;
                    }
                }
                return converted;
            })) : [];

            return {
                rows: rows,
                rowCount: result.rowsAffected,
                rowsAffected: result.rowsAffected
            };
        },

        async release() {
            if (inTransaction) {
                try {
                    await connection.rollback();
                } catch (err) {
                    console.error('Error rolling back on release:', err);
                }
            }
            try {
                await connection.close();
            } catch (err) {
                console.error('Error releasing connection:', err);
            }
        }
    };

    return wrappedClient;
}

/**
 * Close the connection pool (for cleanup)
 */
export async function closePool() {
    if (pool) {
        try {
            await pool.close(10);
            pool = null;
            poolPromise = null;
            console.log('Oracle DB connection pool closed');
        } catch (err) {
            console.error('Error closing pool:', err);
        }
    }
}

// Initialize pool on module load if in production
if (process.env.NODE_ENV === 'production') {
    initPool().catch(err => {
        console.error('Failed to initialize Oracle DB pool:', err);
    });
}

export { convertSQL };

export default {
    query,
    getClient,
    initPool,
    closePool,
    get pool() {
        return pool;
    }
};
