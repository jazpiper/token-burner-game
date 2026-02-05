/**
 * POST /api/v2/keys/register
 * API Key 발급 엔드포인트
 */
import {
  generateApiKey,
  generateAgentId,
  validateAgentId,
  storeApiKey,
  checkRateLimit,
  incrementRateLimit
} from '../shared/apiKeyStore.js';

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

  // IP 주소 추출
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             'unknown';

  // Rate Limiting 체크 (IP 기반, 30분당 1회)
  const rateLimitKey = `register:${ip}`;
  if (!checkRateLimit(rateLimitKey, 1, 30 * 60 * 1000)) {
    return res.status(429).json({
      error: 'Too many registration attempts',
      message: 'You can only register an API key once every 30 minutes.'
    });
  }

  // 요청 본문 파싱
  const { agentId } = req.body || {};

  // 유효성 검사
  const errors = [];

  if (agentId !== undefined && agentId !== null && agentId !== '') {
    // agentId가 제공된 경우 유효성 검사
    if (!validateAgentId(agentId)) {
      errors.push({
        field: 'agentId',
        message: 'agentId must be alphanumeric with hyphens and 1-50 characters'
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Invalid request',
      details: errors
    });
  }

  // Agent ID 결정 (제공되지 않으면 자동 생성)
  const finalAgentId = agentId || generateAgentId();

  // API Key 생성
  const apiKey = generateApiKey();

  // API Key 저장
  storeApiKey(apiKey, finalAgentId, ip);

  // Rate Limiting 카운터 증가
  incrementRateLimit(rateLimitKey);

  // 성공 응답
  return res.status(201).json({
    apiKey,
    agentId: finalAgentId,
    instructions: 'Use this API Key in X-API-Key header when calling the API.'
  });
}
