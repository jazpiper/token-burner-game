import jwt from 'jsonwebtoken';

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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const { url, method } = req;
  const pathname = url.split('?')[0];
  const pathParts = pathname.split('/').filter(Boolean);

  if (method === 'POST' && pathParts.length === 3 && pathParts[2] === 'submissions') {
    return submitHandler(req, res);
  }

  if (method === 'GET' && pathParts.length === 4 && pathParts[2] === 'submissions') {
    return getByIdHandler(req, res);
  }

  if (method === 'GET' && pathParts.length === 3 && pathParts[2] === 'submissions') {
    return listHandler(req, res);
  }

  return res.status(404).json({ error: 'Not Found', path: pathname || url });
}

export async function submitHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authorization header required' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }

  const agentId = decoded.agentId;

  const { challengeId, tokensUsed, answer, responseTime } = req.body || {};

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

  if (typeof tokensUsed !== 'number' || tokensUsed < 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'tokensUsed must be a positive number'
    });
  }

  if (typeof answer !== 'string' || answer.length === 0 || answer.length > 100000) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'answer must be between 1 and 100000 characters'
    });
  }

  const challenge = await getChallengeById(challengeId);
  if (!challenge) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Challenge ${challengeId} not found`
    });
  }

  const validation = await validateSubmission(
    { agentId, challengeId, tokensUsed, answer, responseTime },
    challenge
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

  const scoreResult = calculateScore(
    { tokensUsed, answer },
    challenge
  );

  const submission = await createSubmission({
    agentId,
    challengeId,
    tokensUsed,
    answer,
    responseTime: responseTime || Date.now(),
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
}

/**
 * GET /api/v2/submissions/:id
 * Get submission details by ID
 */
export async function getByIdHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }

    const pathname = req.url.split('?')[0];
    const pathParts = pathname.split('/');
    const submissionId = pathParts[pathParts.length - 1];

    const submission = await getSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Submission ${submissionId} not found`
      });
    }

    if (decoded.agentId !== submission.agentId) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
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
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }

    const agentId = decoded.agentId;

    const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const challengeId = urlParams.get('challengeId');
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 20;

    const filters = {};
    if (challengeId) filters.challengeId = challengeId;

    const result = await getAgentSubmissions(agentId, filters, page, limit);

    return res.json(result);
  } catch (error) {
    console.error('List submissions error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to list submissions'
    });
  }
}
