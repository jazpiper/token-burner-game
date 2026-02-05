/**
 * GET /api/v2/leaderboard - 리더보드
 */
import {
  getLeaderboard,
  getAgentRank
} from '../../services/leaderboardService.js';

/**
 * Rate Limiting (간단한 메모리 기반)
 * 운영 환경에서는 Vercel KV 또는 Redis 사용 권장
 */
const rateLimitMap = new Map();

function checkRateLimit(identifier, maxRequests = 100, windowMs = 60 * 1000) {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

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
    const pathParts = req.url.split('/').filter(Boolean);

    // GET /api/v2/leaderboard
    if (pathParts[2] === 'leaderboard') {
      // Rate Limiting 체크
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
      if (!checkRateLimit(`leaderboard:${ip}`, 100, 60 * 1000)) {
        return res.status(429).json({
          error: 'Too many requests, please try again later'
        });
      }

      // Query parameters
      const type = req.query.type;
      const difficulty = req.query.difficulty;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;

      // 필터 생성
      const filters = {};
      if (type) filters.type = type;
      if (difficulty) filters.difficulty = difficulty;

      // 리더보드 조회
      const leaderboardData = getLeaderboard(filters);

      // 페이징
      const total = leaderboardData.length;
      const offset = (page - 1) * limit;
      const paginated = leaderboardData.slice(offset, offset + limit);

      return res.json({
        leaderboard: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    }

    // GET /api/v2/leaderboard/rank/:agentId
    if (pathParts[3] === 'rank' && pathParts[4]) {
      const agentId = pathParts[4];

      // Rate Limiting 체크
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
      if (!checkRateLimit(`rank:${ip}`, 100, 60 * 1000)) {
        return res.status(429).json({
          error: 'Too many requests, please try again later'
        });
      }

      // Query parameters
      const type = req.query.type;
      const difficulty = req.query.difficulty;

      // 필터 생성
      const filters = {};
      if (type) filters.type = type;
      if (difficulty) filters.difficulty = difficulty;

      // 에이전트 순위 조회
      const rankData = getAgentRank(agentId, filters);

      return res.json(rankData);
    }

    return res.status(404).json({ error: 'Not found', path: req.url });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get leaderboard'
    });
  }
}
