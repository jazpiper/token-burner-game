/**
 * POST /api/v2/auth/token
 * 인증 - API Key로 JWT 토큰 발급
 */
import jwt from 'jsonwebtoken';

// 환경 변수
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const API_KEYS = new Set(
  (process.env.API_KEYS || 'demo-key-123,agent-key-456').split(',').map(k => k.trim())
);

/**
 * API Key 검증
 */
function validateApiKey(apiKey) {
  return API_KEYS.has(apiKey) && apiKey.length > 10;
}

/**
 * JWT 토큰 생성
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Rate Limiting (간단한 메모리 기반)
 * 운영 환경에서는 Vercel KV 또는 Redis 사용 권장
 */
const rateLimitMap = new Map();

function checkRateLimit(identifier, maxRequests = 10, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 요청 본문 파싱
  const { agentId, apiKey } = req.body;

  // 유효성 검사
  if (!agentId || !apiKey) {
    return res.status(400).json({
      error: 'Invalid request',
      details: [
        { field: 'agentId', message: 'agentId is required' },
        { field: 'apiKey', message: 'apiKey is required' }
      ]
    });
  }

  // Rate Limiting 체크 (API Key 기반)
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const rateLimitKey = `auth:${apiKey}`;
  if (!checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000)) {
    return res.status(429).json({
      error: 'Too many authentication attempts, please try again later'
    });
  }

  // API Key 검증
  if (!validateApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // JWT 토큰 발급
  const token = generateToken({ agentId });
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24시간

  return res.json({
    token,
    expiresAt: new Date(expiresAt).toISOString()
  });
}
