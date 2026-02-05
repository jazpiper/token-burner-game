import { gameLogic } from '../../shared/gameLogic.js';
import { createGame, finishGame, getGameById } from '../../services/gameService.js';
import { checkRateLimit } from '../../shared/rateLimitingService.js';

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
}

export default async function handler(req, res) {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const pathname = url.split('?')[0];
  const pathParts = pathname.split('/').filter(Boolean);

  if (method === 'POST' && pathParts[2] === 'games' && pathParts[3] === 'start') {
    const { duration = 5 } = req.body;

    if (duration < 1 || duration > 60) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'duration', message: 'duration must be between 1 and 60 seconds' }]
      });
    }

    const apiKey = req.headers['x-api-key'] || 'anonymous';
    const rateLimitResult = await checkRateLimit(`start:${apiKey}`, 1, 30 * 60 * 1000);

    if (!rateLimitResult.allowed) {
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

  if (method === 'POST' && pathParts[2] === 'games' && pathParts[4] === 'finish') {
    const gameId = pathParts[3];

    if (!gameId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'gameId', message: 'gameId is required' }]
      });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const rateLimitResult = await checkRateLimit(`finish:${ip}`, 100, 60 * 1000);

    if (!rateLimitResult.allowed) {
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
