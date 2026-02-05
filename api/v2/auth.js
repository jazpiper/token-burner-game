/**
 * POST /api/v2/auth/token
 * 인증 - API Key로 JWT 토큰 발급
 */
import jwt from 'jsonwebtoken';
import { validateApiKey, getApiKeyInfo, hashApiKey } from '../../shared/apiKeyStore.js';
import { checkRateLimit } from '../../shared/rateLimitingService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

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

  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({
      error: 'Invalid request',
      details: [
        { field: 'apiKey', message: 'apiKey is required' }
      ]
    });
  }

  const rateLimitKey = `auth:${apiKey}`;
  const rateLimitResult = await checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000);

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Too many authentication attempts, please try again later'
    });
  }

  if (!await validateApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
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
