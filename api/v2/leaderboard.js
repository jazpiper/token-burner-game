/**
 * GET /api/v2/leaderboard - 리더보드
 */

// 메모리 저장소 (운영 환경에서는 Vercel KV 또는 Redis 사용 권장)
const leaderboard = [];

/**
 * Rate Limiting (간단한 메모리 기반)
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

    // 점수 기준 내림차순 정렬 (상위 100개)
    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    return res.json(sortedLeaderboard);
  }

  return res.status(404).json({ error: 'Not found', path: req.url });
}
