/**
 * POST /api/v2/games/:id/actions - 액션 수행
 */
import { gameLogic } from '../../shared/gameLogic.js';
import { getGameById, addGameAction } from '../../services/gameService.js';

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
}

export default async function handler(req, res) {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pathParts = req.url.split('/').filter(Boolean);

  if (pathParts[4] === 'actions') {
    const gameId = pathParts[3];

    if (!gameId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'gameId', message: 'gameId is required' }]
      });
    }

    const { method } = req.body;

    const validMethods = ['chainOfThoughtExplosion', 'recursiveQueryLoop', 'meaninglessTextGeneration', 'hallucinationInduction'];
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'method', message: 'Invalid method' }]
      });
    }

    // PostgreSQL에서 게임 가져오기 (메모리 Map 제거)
    const game = await getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'playing') {
      return res.status(400).json({ error: 'Game is not playing', status: game.status });
    }

    // 게임 로직 실행
    const gameResult = gameLogic.executeAction(game, method);

    // PostgreSQL에 액션 저장 (메모리 Map 제거)
    await addGameAction(gameId, {
      method,
      tokensBurned: gameResult.tokensBurned,
      complexityWeight: gameResult.complexityWeight,
      inefficiencyScore: gameResult.inefficiencyScore,
      textPreview: gameResult.textPreview
    });

    return res.json(gameResult);
  }

  return res.status(404).json({ error: 'Not found', path: req.url });
}
