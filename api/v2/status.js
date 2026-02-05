import { getGameById } from '../../services/gameService.js';

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

  // 경로 파싱
  const pathParts = req.url.split('/').filter(Boolean);

  // GET /api/v2/games/:id
  if (pathParts[2] === 'games' && pathParts[3]) {
    const gameId = pathParts[3];

    if (!gameId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'gameId', message: 'gameId is required' }]
      });
    }

    // Rate Limiting 체크
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    if (!checkRateLimit(`status:${ip}`, 100, 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many requests, please try again later'
      });
    }

    // 게임 조회
    const game = await getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    return res.json(game);
  }

  return res.status(404).json({ error: 'Not found', path: req.url });
}
