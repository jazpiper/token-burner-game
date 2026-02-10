/**
 * POST /api/v2/games/:id/actions - Execute game action
 */
import { gameLogic } from '../../shared/gameLogic.js';
import { getGameById, addGameAction } from '../../services/gameService.js';
import {
  setCORSHeaders,
  handleOptions,
  verifyAuth,
  responses,
  sendResponse
} from './middleware.js';

const validMethods = ['chainOfThoughtExplosion', 'recursiveQueryLoop', 'meaninglessTextGeneration', 'hallucinationInduction'];

export default async function handler(req, res) {
  setCORSHeaders(res, ['POST', 'OPTIONS']);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendResponse(res, {
      status: 405,
      body: { error: 'Method not allowed' }
    });
  }

  // Verify JWT token using middleware utility
  const decoded = verifyAuth(req);
  if (!decoded) {
    return sendResponse(res, responses.unauthorized('Invalid token'));
  }

  const pathParts = req.url.split('/').filter(Boolean);

  if (pathParts[4] === 'actions') {
    const gameId = pathParts[3];

    if (!gameId) {
      return sendResponse(res, responses.badRequest('Missing required fields', [
        { field: 'gameId', message: 'gameId is required' }
      ]));
    }

    const { method, tokensBurned, text, inefficiencyScore } = req.body;

    if (!method || !validMethods.includes(method)) {
      return sendResponse(res, responses.badRequest('Invalid method', [
        { field: 'method', message: 'Invalid method' }
      ]));
    }

    // Get game from database
    const game = await getGameById(gameId);
    if (!game) {
      return sendResponse(res, responses.notFound('Game'));
    }

    if (game.status !== 'playing') {
      return sendResponse(res, {
        status: 400,
        body: { error: 'Game is not playing', status: game.status }
      });
    }

    // Use gameLogic to calculate action results (pure function, no state mutation)
    const actionResult = gameLogic.executeAction(
      {
        tokensBurned: game.tokensBurned,
        complexityWeight: game.complexityWeight,
        inefficiencyScore: game.inefficiencyScore
      },
      method
    );

    // Store action in database using addGameAction
    const dbResult = await addGameAction(gameId, {
      method,
      tokensBurned: actionResult.tokensBurned,
      complexityWeight: actionResult.complexityWeight,
      inefficiencyScore: actionResult.inefficiencyScore || 0,
      textPreview: actionResult.text || text?.substring(0, 500)
    });

    return res.json({
      tokensBurned: dbResult.tokensBurned,
      complexityWeight: dbResult.complexityWeight,
      inefficiencyScore: dbResult.inefficiencyScore,
      score: dbResult.score,
      textPreview: dbResult.textPreview
    });
  }

  return sendResponse(res, responses.notFound());
}
