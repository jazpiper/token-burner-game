/**
 * GET /api/v2/health - Health check endpoint
 */
import db from '../../services/db.js';
import {
  setCORSHeaders,
  handleOptions,
  sendResponse
} from './middleware.js';

export default async function handler(req, res) {
  setCORSHeaders(res, ['GET', 'OPTIONS']);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendResponse(res, {
      status: 405,
      body: { error: 'Method not allowed' }
    });
  }

  try {
    let dbStatus = 'not configured';

    // Check for Oracle DB connection
    if (process.env.ORACLE_USER || process.env.ORACLE_CONNECTION_STRING) {
      try {
        await db.query('SELECT 1 FROM DUAL');
        dbStatus = 'connected (Oracle)';
      } catch (e) {
        dbStatus = 'error: ' + e.message;
      }
    }

    return res.json({
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return sendResponse(res, {
      status: 500,
      body: { status: 'error', message: error.message }
    });
  }
}
