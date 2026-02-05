/**
 * GET /api/v2/leaderboard - 리더보드
 */
import {
  getLeaderboard,
  getAgentRank
} from '../../services/leaderboardService.js';
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

  try {
    const pathname = req.url.split('?')[0];
    const pathParts = pathname.split('/').filter(Boolean);

    if (pathParts.length === 3 && pathParts[2] === 'leaderboard') {
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
      const rateLimitResult = await checkRateLimit(`leaderboard:${ip}`, 100, 60 * 1000);

      if (!rateLimitResult.allowed) {
        return res.status(429).json({
          error: 'Too many requests, please try again later'
        });
      }

      const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
      const type = urlParams.get('type');
      const difficulty = urlParams.get('difficulty');
      const page = parseInt(urlParams.get('page')) || 1;
      const limit = parseInt(urlParams.get('limit')) || 100;

      const filters = {};
      if (type) filters.type = type;
      if (difficulty) filters.difficulty = difficulty;

      const leaderboardData = await getLeaderboard(filters, page, limit);

      return res.json(leaderboardData);
    }

    if (pathParts[3] === 'rank' && pathParts[4]) {
      const agentId = pathParts[4];

      const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
      const rateLimitResult = await checkRateLimit(`rank:${ip}`, 100, 60 * 1000);

      if (!rateLimitResult.allowed) {
        return res.status(429).json({
          error: 'Too many requests, please try again later'
        });
      }

      const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
      const type = urlParams.get('type');
      const difficulty = urlParams.get('difficulty');

      const filters = {};
      if (type) filters.type = type;
      if (difficulty) filters.difficulty = difficulty;

      const rankData = await getAgentRank(agentId, filters);

      return res.json(rankData);
    }

    return res.status(404).json({ error: 'Not found', path: req.url });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get leaderboard'
    });
  }
}
