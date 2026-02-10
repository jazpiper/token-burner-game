/**
 * POST /api/v2/auth/token
 * Authentication - Generate JWT token from API key
 */
import jwt from 'jsonwebtoken';
import { validateApiKey, getApiKeyInfo, hashApiKey } from '../../shared/apiKeyStore.js';
import { checkRateLimit } from '../../shared/rateLimitingService.js';
import {
  setCORSHeaders,
  handleOptions,
  responses,
  sendResponse
} from './middleware.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

function generateToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export default async function handler(req, res) {
  setCORSHeaders(res, ['POST', 'OPTIONS']);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendResponse(res, {
      status: 405,
      body: { error: 'Method not allowed' }
    });
  }

  const { apiKey } = req.body;

  if (!apiKey) {
    return sendResponse(res, responses.badRequest('Missing required fields', [
      { field: 'apiKey', message: 'apiKey is required' }
    ]));
  }

  const rateLimitKey = `auth:${apiKey}`;
  const rateLimitResult = await checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000);

  if (!rateLimitResult.allowed) {
    return sendResponse(res, responses.tooManyRequests('Too many authentication attempts, please try again later'));
  }

  if (!await validateApiKey(apiKey)) {
    return sendResponse(res, responses.unauthorized('Invalid API key'));
  }

  const keyInfo = await getApiKeyInfo(apiKey);

  const token = generateToken({
    agentId: keyInfo.agentId,
    keyHash: hashApiKey(apiKey)
  });

  const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

  return res.json({
    token,
    agentId: keyInfo.agentId,
    expiresAt: new Date(expiresAt).toISOString()
  });
}
