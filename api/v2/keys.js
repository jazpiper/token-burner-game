/**
 * POST /api/v2/keys/register
 * API Key registration endpoint
 */
import {
  generateApiKey,
  generateAgentId,
  validateAgentId,
  storeApiKey
} from '../../shared/apiKeyStore.js';
import { checkRateLimit } from '../../shared/rateLimitingService.js';
import {
  setCORSHeaders,
  handleOptions,
  responses,
  sendResponse
} from './middleware.js';

export default async function handler(req, res) {
  setCORSHeaders(res, ['POST', 'OPTIONS']);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendResponse(res, {
      status: 405,
      body: { error: 'Method not allowed' }
    });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    'unknown';

  // Rate Limiting check (IP based, once per 30 minutes)
  const rateLimitKey = `register:${ip}`;
  const rateLimitResult = await checkRateLimit(rateLimitKey, 1, 30 * 60 * 1000);

  if (!rateLimitResult.allowed) {
    return sendResponse(res, responses.tooManyRequests('You can only register an API key once every 30 minutes.'));
  }

  const { agentId } = req.body || {};

  if (agentId && !validateAgentId(agentId)) {
    return sendResponse(res, responses.badRequest('Invalid agentId format', [
      {
        field: 'agentId',
        message: 'agentId must be alphanumeric with hyphens and 1-50 characters'
      }
    ]));
  }

  const finalAgentId = agentId || generateAgentId();
  const apiKey = generateApiKey();

  try {
    await storeApiKey(apiKey, finalAgentId, ip);
  } catch (dbError) {
    return sendResponse(res, responses.internalError(dbError.message));
  }

  return res.status(201).json({
    apiKey,
    agentId: finalAgentId,
    instructions: 'Use this API Key in X-API-Key header when calling API.'
  });
}
