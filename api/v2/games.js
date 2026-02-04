/**
 * POST /api/v2/games/start - 게임 시작
 * POST /api/v2/games/:id/finish - 게임 종료
 */
import { gameLogic } from '../shared/gameLogic.js';

// 메모리 저장소 (운영 환경에서는 Vercel KV 또는 Redis 사용 권장)
const games = new Map();
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
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

  const { url } = req;
  const method = req.method;

  // 경로 파싱
  const pathParts = url.split('/').filter(Boolean);

  // POST /api/v2/games/start - 게임 시작
  if (method === 'POST' && pathParts[2] === 'games' && pathParts[3] === 'start') {
    const { duration = 5 } = req.body;

    // 유효성 검사
    if (duration < 1 || duration > 60) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'duration', message: 'duration must be between 1 and 60 seconds' }]
      });
    }

    // Rate Limiting 체크 (30분당 1회, API Key 기반)
    const apiKey = req.headers['x-api-key'] || 'anonymous';
    if (!checkRateLimit(`start:${apiKey}`, 1, 30 * 60 * 1000)) {
      return res.status(429).json({
        error: 'You can only start a game once every 30 minutes. Please try again later.'
      });
    }

    const game = gameLogic.createGame(duration);
    games.set(game.gameId, game);

    return res.json({
      gameId: game.gameId,
      status: game.status,
      endsAt: new Date(game.endsAt).toISOString(),
      duration
    });
  }

  // POST /api/v2/games/:id/finish - 게임 종료
  if (method === 'POST' && pathParts[2] === 'games' && pathParts[4] === 'finish') {
    const gameId = pathParts[3];

    if (!gameId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'gameId', message: 'gameId is required' }]
      });
    }

    // Rate Limiting 체크
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    if (!checkRateLimit(`finish:${ip}`, 100, 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many requests, please try again later'
      });
    }

    // 게임 조회
    const game = games.get(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // 게임 종료
    const result = gameLogic.finishGame(game);

    // 리더보드에 추가
    const apiKey = req.headers['x-api-key'] || 'anonymous';
    leaderboard.push({
      gameId: result.gameId,
      agentId: apiKey,
      score: result.finalScore,
      tokensBurned: result.tokensBurned,
      timestamp: new Date().toISOString()
    });

    // 게임 상태 업데이트
    games.set(gameId, game);

    // 완료된 게임 정리 (최근 1000개만 유지)
    if (games.size > 1000) {
      const oldestId = Array.from(games.keys())[0];
      games.delete(oldestId);
    }

    return res.json(result);
  }

  return res.status(404).json({ error: 'Not found', path: url });
}
