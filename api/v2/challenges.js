/**
 * Challenge API Endpoints
 * 
 * GET /api/v2/challenges/random - Get random challenge
 * GET /api/v2/challenges/:id - Get challenge details
 * GET /api/v2/challenges - List all challenges
 */
import {
  getRandomChallenge,
  getChallengeById,
  getAllChallenges
} from '../../services/challengeService.js';

/**
 * Vercel Serverless Function Handler
 */
export default async function (req, res) {
  const { url } = req;
  const pathname = url.split('?')[0];
  const pathParts = pathname.split('/').filter(Boolean);

  // Route: /api/v2/challenges/random
  if (pathParts[pathParts.length - 1] === 'random') {
    return handler(req, res);
  }

  // Route: /api/v2/challenges/:id
  if (pathParts.length > 3 && pathParts[2] === 'challenges' && pathParts[3] !== 'random') {
    return getByIdHandler(req, res);
  }

  // Route: /api/v2/challenges
  if (pathParts.length === 3 && pathParts[2] === 'challenges') {
    return listHandler(req, res);
  }

  return res.status(404).json({ error: 'Not Found', path: pathname || url });
}

export async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Query parameters
    const difficulty = req.query.difficulty;
    const type = req.query.type;

    // 필터 생성
    const filters = {};
    if (difficulty) filters.difficulty = difficulty;
    if (type) filters.type = type;

    // 랜덤 챌린지 반환
    const challenge = getRandomChallenge(filters);

    if (!challenge) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No challenge found matching the filters'
      });
    }

    return res.json(challenge);
  } catch (error) {
    console.error('Get random challenge error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get random challenge'
    });
  }
}

/**
 * GET /api/v2/challenges/:id
 * Get challenge details by ID
 */
export async function getByIdHandler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // URL에서 challenge ID 추출
    const pathParts = req.url.split('/');
    const challengeId = pathParts[pathParts.length - 1];

    // 챌린지 상세 조회
    const challenge = getChallengeById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Challenge ${challengeId} not found`
      });
    }

    return res.json(challenge);
  } catch (error) {
    console.error('Get challenge by ID error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get challenge details'
    });
  }
}

/**
 * GET /api/v2/challenges
 * List all challenges
 */
export async function listHandler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Query parameters
    const difficulty = req.query.difficulty;
    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // 필터 생성
    const filters = {};
    if (difficulty) filters.difficulty = difficulty;
    if (type) filters.type = type;

    // 전체 챌린지 목록 조회
    const result = getAllChallenges(filters, page, limit);

    return res.json(result);
  } catch (error) {
    console.error('List challenges error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to list challenges'
    });
  }
}
