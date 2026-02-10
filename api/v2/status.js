/**
 * GET /api/v2/games/:id - Get game status
 */
import { getGameById } from '../../services/gameService.js';
import { checkRateLimit } from '../../shared/rateLimitingService.js';
import {
  setCORSHeaders,
  handleOptions,
  responses,
  sendResponse
} from './middleware.js';

export default async function handler(req, res) {
  setCORSHeaders(res, ['GET', 'OPTIONS']);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendResponse(res, {
      status: 405,
      body: { error: 'Method not allowed' }
    });
  }

  const pathParts = req.url.split('/').filter(Boolean);

  if (pathParts[2] === 'games' && pathParts[3]) {
    const gameId = pathParts[3];

    if (!gameId) {
      return sendResponse(res, responses.badRequest('Missing required fields', [
        { field: 'gameId', message: 'gameId is required' }
      ]));
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const rateLimitResult = await checkRateLimit(`status:${ip}`, 100, 60 * 1000);

    if (!rateLimitResult.allowed) {
      return sendResponse(res, responses.tooManyRequests());
    }

    const game = await getGameById(gameId);
    if (!game) {
      return sendResponse(res, responses.notFound('Game'));
    }

    return res.json(game);
  }

  return sendResponse(res, responses.notFound());
}
