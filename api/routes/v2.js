/**
 * API v2 Routes
 * AI Agent를 위한 REST API 엔드포인트
 */
import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { gameLogic } from '../shared/gameLogic.js';
import { generateToken, validateApiKey } from '../middleware/auth.js';
import { generalRateLimit, strictRateLimit, authRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// 메모리 저장소 (운영 환경에서는 Redis 또는 데이터베이스 사용 권장)
const games = new Map();
const leaderboard = [];

/**
 * POST /api/v2/auth/token
 * 인증 - API Key로 JWT 토큰 발급
 */
router.post('/auth/token',
  authRateLimit,
  [
    body('agentId').notEmpty().withMessage('agentId is required'),
    body('apiKey').notEmpty().withMessage('apiKey is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid request', details: errors.array() });
    }

    const { agentId, apiKey } = req.body;

    // API Key 검증
    if (!validateApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // JWT 토큰 발급
    const token = generateToken({ agentId });
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24시간

    res.json({
      token,
      expiresAt: new Date(expiresAt).toISOString()
    });
  }
);

/**
 * POST /api/v2/games/start
 * 게임 시작
 */
router.post('/games/start',
  generalRateLimit,
  [
    body('duration').optional().isInt({ min: 1, max: 60 }).withMessage('duration must be between 1 and 60 seconds')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid request', details: errors.array() });
    }

    const { duration = 5 } = req.body;
    const game = gameLogic.createGame(duration);

    // 게임 저장
    games.set(game.gameId, game);

    res.json({
      gameId: game.gameId,
      status: game.status,
      endsAt: new Date(game.endsAt).toISOString(),
      duration
    });
  }
);

/**
 * POST /api/v2/games/:id/actions
 * 액션 수행
 */
router.post('/games/:id/actions',
  strictRateLimit,
  [
    param('id').notEmpty().withMessage('gameId is required'),
    body('method').isIn(['chainOfThoughtExplosion', 'recursiveQueryLoop', 'meaninglessTextGeneration', 'hallucinationInduction'])
      .withMessage('Invalid method')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid request', details: errors.array() });
    }

    const { id } = req.params;
    const { method } = req.body;

    // 게임 조회
    const game = games.get(id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // 게임 상태 확인
    const status = gameLogic.getGameStatus(game);
    if (status.status !== 'playing') {
      return res.status(400).json({ error: 'Game is not playing', status: status.status });
    }

    // 액션 실행
    try {
      const result = gameLogic.executeAction(game, method);

      // 게임 상태 업데이트
      games.set(id, game);

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/v2/games/:id
 * 상태 조회
 */
router.get('/games/:id',
  generalRateLimit,
  [
    param('id').notEmpty().withMessage('gameId is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid request', details: errors.array() });
    }

    const { id } = req.params;

    // 게임 조회
    const game = games.get(id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // 게임 상태 반환
    const status = gameLogic.getGameStatus(game);
    res.json(status);
  }
);

/**
 * POST /api/v2/games/:id/finish
 * 게임 종료
 */
router.post('/games/:id/finish',
  generalRateLimit,
  [
    param('id').notEmpty().withMessage('gameId is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid request', details: errors.array() });
    }

    const { id } = req.params;

    // 게임 조회
    const game = games.get(id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // 게임 종료
    const result = gameLogic.finishGame(game);

    // 리더보드에 추가
    leaderboard.push({
      gameId: result.gameId,
      agentId: req.apiKey || 'anonymous',
      score: result.finalScore,
      tokensBurned: result.tokensBurned,
      timestamp: new Date().toISOString()
    });

    // 게임 상태 업데이트
    games.set(id, game);

    // 완료된 게임 정리 (최근 100개만 유지)
    if (games.size > 1000) {
      // 가장 오래된 게임 제거
      const oldestId = Array.from(games.keys())[0];
      games.delete(oldestId);
    }

    res.json(result);
  }
);

/**
 * GET /api/v2/leaderboard
 * 리더보드
 */
router.get('/leaderboard',
  generalRateLimit,
  (req, res) => {
    // 점수 기준 내림차순 정렬 (상위 100개)
    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    res.json(sortedLeaderboard);
  }
);

/**
 * GET /api/v2/health
 * 헬스체크
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeGames: games.size,
    totalScores: leaderboard.length
  });
});

export default router;
