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
import {
  setCORSHeaders,
  handleOptions,
  parseQueryParams,
  buildFilters,
  responses,
  sendResponse
} from './middleware.js';

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

  return sendResponse(res, responses.notFound());
}

export async function handler(req, res) {
  setCORSHeaders(res, ['GET', 'OPTIONS']);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendResponse(res, {
      status: 405,
      body: { error: 'Method not allowed' }
    });
  }

  try {
    const params = parseQueryParams(req);
    const filters = buildFilters(params, ['difficulty', 'type']);

    const challenge = await getRandomChallenge(filters);

    if (!challenge) {
      return sendResponse(res, responses.notFound('No challenge found matching the filters'));
    }

    return res.json(challenge);
  } catch (error) {
    console.error('Get random challenge error:', error);
    return sendResponse(res, responses.internalError('Failed to get random challenge'));
  }
}

/**
 * GET /api/v2/challenges/:id
 * Get challenge details by ID
 */
export async function getByIdHandler(req, res) {
  setCORSHeaders(res, ['GET', 'OPTIONS']);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendResponse(res, {
      status: 405,
      body: { error: 'Method not allowed' }
    });
  }

  try {
    // URL에서 challenge ID 추출
    const pathname = req.url.split('?')[0];
    const pathParts = pathname.split('/');
    const challengeId = pathParts[pathParts.length - 1];

    // 챌린지 상세 조회 (Async 호출)
    const challenge = await getChallengeById(challengeId);

    if (!challenge) {
      return sendResponse(res, responses.notFound(`Challenge ${challengeId}`));
    }

    return res.json(challenge);
  } catch (error) {
    console.error('Get challenge by ID error:', error);
    return sendResponse(res, responses.internalError('Failed to get challenge details'));
  }
}

/**
 * GET /api/v2/challenges
 * List all challenges
 */
export async function listHandler(req, res) {
  setCORSHeaders(res, ['GET', 'OPTIONS']);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendResponse(res, {
      status: 405,
      body: { error: 'Method not allowed' }
    });
  }

  try {
    const params = parseQueryParams(req, { page: 1, limit: 20 });
    const filters = buildFilters(params, ['difficulty', 'type']);

    // 전체 챌린지 목록 조회 (Async 호출)
    const result = await getAllChallenges(filters, params.page, params.limit);

    return res.json(result);
  } catch (error) {
    console.error('List challenges error:', error);
    return sendResponse(res, responses.internalError('Failed to list challenges'));
  }
}
