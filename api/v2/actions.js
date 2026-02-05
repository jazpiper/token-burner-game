import { gameLogic } from '../../shared/gameLogic.js';
import { addGameAction, getGameById } from '../../services/gameService.js';

const rateLimitMap = new Map();

function checkRateLimit(identifier, maxRequests = 50, windowMs = 60 * 1000) {
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 경로 파싱
  const pathParts = req.url.split('/').filter(Boolean);

  // POST /api/v2/games/:id/actions
  if (pathParts[4] === 'actions') {
    const gameId = pathParts[3];

    if (!gameId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'gameId', message: 'gameId is required' }]
      });
    }

    const { method } = req.body;

    // 유효성 검사
    const validMethods = ['chainOfThoughtExplosion', 'recursiveQueryLoop', 'meaninglessTextGeneration', 'hallucinationInduction'];
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'method', message: 'Invalid method' }]
      });
    }

    // Rate Limiting 체크 (엄격한 제한)
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    if (!checkRateLimit(`actions:${ip}`, 50, 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many actions, please slow down'
      });
    }

    // 게임 조회
    const game = await getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'playing') {
      return res.status(400).json({ error: 'Game is not playing', status: game.status });
    }

    // 액션 실행
    try {
      const gameResult = gameLogic.executeAction(game, method);

      const result = await addGameAction(gameId, {
        method,
        tokensBurned: gameResult.tokensBurned,
        complexityWeight: gameResult.complexityWeight,
        inefficiencyScore: gameResult.inefficiencyScore,
        textPreview: gameResult.text?.substring(0, 500) || ''
      });

      return res.json(result);
    } catch (error) {
      console.error('Failed to execute action:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(404).json({ error: 'Not found', path: req.url });
}
