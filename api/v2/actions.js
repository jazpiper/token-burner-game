/**
 * POST /api/v2/games/:id/actions - 액션 수행
 */
import { gameLogic } from '../../shared/gameLogic.js';
import { getGameById, addGameAction } from '../../services/gameService.js';
<<<<<<< HEAD
=======
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
>>>>>>> main-t

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

  // Verify JWT token
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authorization header required' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
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

    const { method, tokensBurned, text, inefficiencyScore } = req.body;

    const validMethods = ['chainOfThoughtExplosion', 'recursiveQueryLoop', 'meaninglessTextGeneration', 'hallucinationInduction'];
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({
        error: 'Invalid request',
        details: [{ field: 'method', message: 'Invalid method' }]
      });
    }

<<<<<<< HEAD
    // PostgreSQL에서 게임 가져오기 (메모리 Map 제거)
=======
    // Get game from database instead of memory Map
>>>>>>> main-t
    const game = await getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'playing') {
      return res.status(400).json({ error: 'Game is not playing', status: game.status });
    }

<<<<<<< HEAD
    // 게임 로직 실행
    const gameResult = gameLogic.executeAction(game, method);

    // PostgreSQL에 액션 저장 (메모리 Map 제거)
    await addGameAction(gameId, {
      method,
      tokensBurned: gameResult.tokensBurned,
      complexityWeight: gameResult.complexityWeight,
      inefficiencyScore: gameResult.inefficiencyScore,
      textPreview: gameResult.textPreview
=======
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
>>>>>>> main-t
    });

    return res.json({
      tokensBurned: dbResult.tokensBurned,
      complexityWeight: dbResult.complexityWeight,
      inefficiencyScore: dbResult.inefficiencyScore,
      score: dbResult.score,
      textPreview: dbResult.textPreview
    });
  }

  return res.status(404).json({ error: 'Not found', path: req.url });
}
