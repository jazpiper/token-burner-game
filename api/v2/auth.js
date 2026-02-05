/**
 * POST /api/v2/auth/token
 * 인증 - API Key로 JWT 토큰 발급
 */
import jwt from 'jsonwebtoken';
import { validateApiKey, getApiKeyInfo } from '../../shared/apiKeyStore.js';

// 환경 변수
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * JWT 토큰 생성
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Rate Limiting (간단한 메모리 기반)
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
  const { apiKey } = req.body;

  // 유효성 검사
  if (!apiKey) {
    return res.status(400).json({
      error: 'Invalid request',
      details: [
        { field: 'apiKey', message: 'apiKey is required' }
      ]
    });
  }

  // Rate Limiting 체크 (API Key 기반)
  const rateLimitKey = `auth:${apiKey}`;
  if (!checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000)) {
    return res.status(429).json({
      error: 'Too many authentication attempts, please try again later'
    });
  }

  // API Key 검증 (Shared Store 사용)
  if (!await validateApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key', received: apiKey });
  }

  // 정보 조회
  const keyInfo = await getApiKeyInfo(apiKey);

  // JWT 토큰 발급
  const token = generateToken({
    agentId: keyInfo.agentId,
    apiKey: apiKey
  });
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24시간

  return res.json({
    token,
    agentId: keyInfo.agentId,
    expiresAt: new Date(expiresAt).toISOString()
  });
}
