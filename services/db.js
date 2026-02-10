/**
 * DB Connection Service
 * Uses Oracle Database
 */

import oracledbWrapper from './db-oracle.js';

// Re-export everything from db-oracle.js
export const query = oracledbWrapper.query;
export const getClient = oracledbWrapper.getClient;
export const initPool = oracledbWrapper.initPool;
export const closePool = oracledbWrapper.closePool;

export default {
    query: oracledbWrapper.query,
    getClient: oracledbWrapper.getClient,
    initPool: oracledbWrapper.initPool,
    closePool: oracledbWrapper.closePool,
    get pool() {
        return oracledbWrapper.pool;
    }
};
