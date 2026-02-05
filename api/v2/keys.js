/**
 * POST /api/v2/keys/register
 * API Key 발급 엔드포인트
 */
import {
  generateApiKey,
  generateAgentId,
  validateAgentId,
  storeApiKey
} from '../../shared/apiKeyStore.js';
import { checkRateLimit } from '../../shared/rateLimitingService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    'unknown';

  // Rate Limiting 체크 (IP 기반, 30분당 1회)
  const rateLimitKey = `register:${ip}`;
  const rateLimitResult = await checkRateLimit(rateLimitKey, 1, 30 * 60 * 1000);

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Too many registration attempts',
      message: 'You can only register an API key once every 30 minutes.'
    });
  }

  const { agentId } = req.body || {};

  if (agentId && !validateAgentId(agentId)) {
    return res.status(400).json({
      error: 'Invalid request',
      details: [{
        field: 'agentId',
        message: 'agentId must be alphanumeric with hyphens and 1-50 characters'
      }]
    });
  }

  const finalAgentId = agentId || generateAgentId();

  const apiKey = generateApiKey();

  try {
    await storeApiKey(apiKey, finalAgentId, ip);
  } catch (dbError) {
    return res.status(500).json({
      error: 'Database Error',
      message: dbError.message,
      hint: 'Check if api_keys table exists and matches schema'
    });
  }

  return res.status(201).json({
    apiKey,
    agentId: finalAgentId,
    instructions: 'Use this API Key in X-API-Key header when calling API.'
  });
}
