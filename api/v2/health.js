/**
 * GET /api/v2/health - 헬스체크
 */
import db from '../services/db.js';

/**
 * CORS 헤더 설정
 */
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
}

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req, res) {
  setCORSHeaders(res);

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 경로 파싱
    const pathname = req.url.split('?')[0];
    const pathParts = pathname.split('/').filter(Boolean);

    // GET /api/v2/health
    if (pathParts[2] === 'health') {
      let dbStatus = 'connected';
      try {
        await db.query('SELECT 1');
      } catch (e) {
        dbStatus = 'error: ' + e.message;
      }

      return res.json({
        status: 'healthy',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
      });
    }

    return res.status(404).json({ error: 'Not found', path: req.url });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
