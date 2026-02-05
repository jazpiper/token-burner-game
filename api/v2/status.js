import { getGameById } from '../../services/gameService.js';
import { checkRateLimit } from '../../shared/rateLimitingService.js';

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
}

export default async function handler(req, res) {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pathParts = req.url.split('/').filter(Boolean);

  if (pathParts[2] === 'games' && pathParts[3]) {
    const gameId = pathParts[3];

    if (!gameId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'gameId', message: 'gameId is required' }]
      });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const rateLimitResult = await checkRateLimit(`status:${ip}`, 100, 60 * 1000);

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Too many requests, please try again later'
      });
    }

    const game = await getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    return res.json(game);
  }

  return res.status(404).json({ error: 'Not found', path: req.url });
}
