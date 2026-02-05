import { gameLogic } from '../../shared/gameLogic.js';
import { createGame, finishGame, getGameById } from '../../services/gameService.js';

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

  const { url, method } = req;
  const pathname = url.split('?')[0];
  const pathParts = pathname.split('/').filter(Boolean);

  // POST /api/v2/games/start - 게임 시작
  if (method === 'POST' && pathParts[2] === 'games' && pathParts[3] === 'start') {
    const { duration = 5 } = req.body;

    if (duration < 1 || duration > 60) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'duration', message: 'duration must be between 1 and 60 seconds' }]
      });
    }

    const apiKey = req.headers['x-api-key'] || 'anonymous';
    if (!checkRateLimit(`start:${apiKey}`, 1, 30 * 60 * 1000)) {
      return res.status(429).json({
        error: 'You can only start a game once every 30 minutes. Please try again later.'
      });
    }

    const gameId = gameLogic.generateGameId();
    try {
      const game = await createGame({ gameId, agentId: apiKey, duration });

      return res.json({
        gameId: game.gameId,
        status: game.status,
        endsAt: game.endsAt.toISOString(),
        duration
      });
    } catch (e) {
      console.error('Failed to create game:', e.message);
      return res.status(500).json({ error: 'Failed to create game' });
    }
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

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    if (!checkRateLimit(`finish:${ip}`, 100, 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many requests, please try again later'
      });
    }

    try {
      const result = await finishGame(gameId);

      if (!result) {
        return res.status(404).json({ error: 'Game not found' });
      }

      return res.json(result);
    } catch (e) {
      console.error('Failed to finish game:', e.message);
      return res.status(500).json({ error: 'Failed to finish game' });
    }
  }

  return res.status(404).json({ error: 'Not found', path: url });
}
