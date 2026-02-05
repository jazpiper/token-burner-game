/**
 * Submission API Endpoints
 * 
 * POST /api/v2/submissions - Submit result
 * GET /api/v2/submissions/:id - Get submission details
 * GET /api/v2/submissions - List agent submissions
 */
import {
  createSubmission,
  getSubmissionById,
  getAgentSubmissions
} from '../../services/submissionService.js';
import {
  validateSubmission,
  calculateScore
} from '../../services/validationService.js';
import {
  getChallengeById
} from '../../services/challengeService.js';

/**
 * Vercel Serverless Function Handler
 */
export default async function (req, res) {
  const { url, method } = req;
  const pathParts = url.split('/').filter(Boolean);

  // Route: POST /api/v2/submissions
  if (method === 'POST' && pathParts.length === 3 && pathParts[2] === 'submissions') {
    return handler(req, res);
  }

  // Route: GET /api/v2/submissions/:id
  if (method === 'GET' && pathParts.length === 4 && pathParts[2] === 'submissions') {
    return getByIdHandler(req, res);
  }

  // Route: GET /api/v2/submissions
  if (method === 'GET' && pathParts.length === 3 && pathParts[2] === 'submissions') {
    return listHandler(req, res);
  }

  return res.status(404).json({ error: 'Not Found', path: url });
}

export async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 요청 본문 파싱
    const { challengeId, tokensUsed, answer, responseTime } = req.body || {};

    // 필수 필드 검증
    if (!challengeId || !tokensUsed || !answer) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields',
        details: [
          { field: 'challengeId', message: 'challengeId is required' },
          { field: 'tokensUsed', message: 'tokensUsed is required' },
          { field: 'answer', message: 'answer is required' }
        ]
      });
    }

    // 타입 검증
    if (typeof tokensUsed !== 'number' || tokensUsed < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'tokensUsed must be a positive number'
      });
    }

    if (typeof answer !== 'string' || answer.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'answer must be a non-empty string'
      });
    }

    // 챌린지 존재 확인
    const challenge = getChallengeById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Challenge ${challengeId} not found`
      });
    }

    // Agent ID 추출 (헤더 또는 본문에서)
    const agentId = req.headers['x-agent-id'] || req.body.agentId;
    if (!agentId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'agentId is required (in X-Agent-Id header or request body)'
      });
    }

    // 토큰 검증
    const validation = await validateSubmission(
      { agentId, challengeId, tokensUsed, answer, responseTime },
      challengeId
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation Failed',
        message: 'Submission validation failed',
        validation: {
          errors: validation.errors,
          warnings: validation.warnings
        }
      });
    }

    // 점수 계산
    const scoreResult = calculateScore(
      { tokensUsed, answer },
      challenge
    );

    // 제출 생성
    const submission = createSubmission({
      agentId,
      challengeId,
      tokensUsed,
      answer,
      responseTime: responseTime || Date.now(), // 기본값: 현재 시간
      score: scoreResult.score,
      validation
    });

    return res.status(201).json({
      submissionId: submission.submissionId,
      agentId: submission.agentId,
      challengeId: submission.challengeId,
      tokensUsed: submission.tokensUsed,
      score: submission.score,
      scoreBreakdown: scoreResult.breakdown,
      validation: {
        errors: validation.errors,
        warnings: validation.warnings
      },
      validatedAt: submission.validatedAt
    });
  } catch (error) {
    console.error('Submit result error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to submit result'
    });
  }
}

/**
 * GET /api/v2/submissions/:id
 * Get submission details by ID
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
    // URL에서 submission ID 추출
    const pathParts = req.url.split('/');
    const submissionId = pathParts[pathParts.length - 1];

    // 제출 상세 조회
    const submission = getSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Submission ${submissionId} not found`
      });
    }

    return res.json(submission);
  } catch (error) {
    console.error('Get submission by ID error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get submission details'
    });
  }
}

/**
 * GET /api/v2/submissions
 * List agent submissions
 */
export async function listHandler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Agent ID 추출
    const agentId = req.headers['x-agent-id'] || req.query.agentId;

    if (!agentId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'agentId is required (in X-Agent-Id header or query parameter)'
      });
    }

    // Query parameters
    const challengeId = req.query.challengeId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // 필터 생성
    const filters = {};
    if (challengeId) filters.challengeId = challengeId;

    // 에이전트 제출 기록 조회
    const result = getAgentSubmissions(agentId, filters, page, limit);

    return res.json(result);
  } catch (error) {
    console.error('List submissions error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to list submissions'
    });
  }
}
