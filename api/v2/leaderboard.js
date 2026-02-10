/**
 * GET /api/v2/leaderboard - Get leaderboard
 * GET /api/v2/leaderboard/rank/:agentId - Get agent rank
 */
import {
  getLeaderboard,
  getAgentRank
} from '../../services/leaderboardService.js';
import { checkRateLimit } from '../../shared/rateLimitingService.js';
import {
  setCORSHeaders,
  handleOptions,
  parseQueryParams,
  buildFilters,
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

  try {
    const pathname = req.url.split('?')[0];
    const pathParts = pathname.split('/').filter(Boolean);

    // Route: /api/v2/leaderboard
    if (pathParts.length === 3 && pathParts[2] === 'leaderboard') {
      return listHandler(req, res);
    }

    // Route: /api/v2/leaderboard/rank/:agentId
    if (pathParts[3] === 'rank' && pathParts[4]) {
      return getRankHandler(req, res, pathParts[4]);
    }

    return sendResponse(res, responses.notFound());
  } catch (error) {
    console.error('Leaderboard error:', error);
    return sendResponse(res, responses.internalError('Failed to get leaderboard'));
  }
}

/**
 * GET /api/v2/leaderboard
 * List leaderboard entries
 */
async function listHandler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const rateLimitResult = await checkRateLimit(`leaderboard:${ip}`, 100, 60 * 1000);

  if (!rateLimitResult.allowed) {
    return sendResponse(res, responses.tooManyRequests());
  }

  const params = parseQueryParams(req, { page: 1, limit: 100 });
  const filters = buildFilters(params, ['type', 'difficulty']);

  const leaderboardData = await getLeaderboard(filters, params.page, params.limit);

  return res.json(leaderboardData);
}

/**
 * GET /api/v2/leaderboard/rank/:agentId
 * Get agent rank
 */
async function getRankHandler(req, res, agentId) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const rateLimitResult = await checkRateLimit(`rank:${ip}`, 100, 60 * 1000);

  if (!rateLimitResult.allowed) {
    return sendResponse(res, responses.tooManyRequests());
  }

  const params = parseQueryParams(req);
  const filters = buildFilters(params, ['type', 'difficulty']);

  const rankData = await getAgentRank(agentId, filters);

  return res.json(rankData);
}
