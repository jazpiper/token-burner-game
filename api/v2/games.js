/**
 * POST /api/v2/games/start - Start a new game
 * POST /api/v2/games/:id/finish - Finish a game
 */
import { gameLogic } from '../../shared/gameLogic.js';
import { createGame, finishGame, getGameById } from '../../services/gameService.js';
import { checkRateLimit } from '../../shared/rateLimitingService.js';
import {
  setCORSHeaders,
  handleOptions,
  responses,
  sendResponse
} from './middleware.js';

export default async function handler(req, res) {
  setCORSHeaders(res, ['POST', 'GET', 'OPTIONS']);
  if (handleOptions(req, res)) return;

  const { url, method } = req;
  const pathname = url.split('?')[0];
  const pathParts = pathname.split('/').filter(Boolean);

  if (method === 'POST' && pathParts[2] === 'games' && pathParts[3] === 'start') {
    return startGameHandler(req, res);
  }

  if (method === 'POST' && pathParts[2] === 'games' && pathParts[4] === 'finish') {
    return finishGameHandler(req, res, pathParts[3]);
  }

  return sendResponse(res, responses.notFound());
}

/**
 * POST /api/v2/games/start
 * Start a new game
 */
async function startGameHandler(req, res) {
  const { duration = 5 } = req.body;

  if (duration < 1 || duration > 60) {
    return sendResponse(res, responses.badRequest('Invalid duration', [
      { field: 'duration', message: 'duration must be between 1 and 60 seconds' }
    ]));
  }

  const apiKey = req.headers['x-api-key'] || 'anonymous';

  // Rate Limiting: relaxed in development environment
  const isDev = process.env.NODE_ENV === 'development';
  const rateLimitMaxRequests = isDev ? 10 : 1;
  const rateLimitWindowMs = isDev ? 60 * 1000 : 30 * 60 * 1000;
  const rateLimitMessage = isDev
    ? 'You can start a game once every minute. Please try again later.'
    : 'You can only start a game once every 30 minutes. Please try again later.';

  const rateLimitResult = await checkRateLimit(`start:${apiKey}`, rateLimitMaxRequests, rateLimitWindowMs);

  if (!rateLimitResult.allowed) {
    return sendResponse(res, responses.tooManyRequests(rateLimitMessage));
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
    return sendResponse(res, responses.internalError('Failed to create game'));
  }
}

/**
 * POST /api/v2/games/:id/finish
 * Finish a game
 */
async function finishGameHandler(req, res, gameId) {
  if (!gameId) {
    return sendResponse(res, responses.badRequest('Missing required fields', [
      { field: 'gameId', message: 'gameId is required' }
    ]));
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const rateLimitResult = await checkRateLimit(`finish:${ip}`, 100, 60 * 1000);

  if (!rateLimitResult.allowed) {
    return sendResponse(res, responses.tooManyRequests());
  }

  try {
    const result = await finishGame(gameId);

    if (!result) {
      return sendResponse(res, responses.notFound('Game'));
    }

    return res.json(result);
  } catch (e) {
    console.error('Failed to finish game:', e.message);
    return sendResponse(res, responses.internalError('Failed to finish game'));
  }
}
