/**
 * GET /api/v2/health - 헬스체크
 */
import { gameLogic } from '../../shared/gameLogic.js';

// 메모리 저장소 (운영 환경에서는 Vercel KV 또는 Redis 사용 권장)
const games = new Map();
const leaderboard = [];

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

  // 경로 파싱
  const pathParts = req.url.split('/').filter(Boolean);

  // GET /api/v2/health
  if (pathParts[2] === 'health') {
    return res.json({
      status: 'healthy',
      database: 'not configured (using memory storage)',
      timestamp: new Date().toISOString(),
      activeGames: games.size,
      totalScores: leaderboard.length,
      env: process.env.NODE_ENV || 'development'
    });
  }

  return res.status(404).json({ error: 'Not found', path: req.url });
}
