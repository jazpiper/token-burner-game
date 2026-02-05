/**
 * API Key Store - Shared storage for API keys
 * In-memory Map for development. Use Vercel KV or Redis for production.
 */

// API Keys storage: { apiKey: { agentId, createdAt, ip } }
const apiKeys = new Map();

// Rate limiting storage for API key registration: { identifier: { count, resetAt } }
const rateLimitMap = new Map();

/**
 * API Key 생성
 * Format: jzp-{random}-{timestamp}
 */
export function generateApiKey() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `jzp-${random}-${timestamp}`;
}

/**
 * Agent ID 생성 (자동 생성용)
 * Format: agent-{random}
 */
export function generateAgentId() {
  const random = Math.random().toString(36).substring(2, 10);
  return `agent-${random}`;
}

/**
 * Agent ID 유효성 검사
 * 알파벳, 숫자, 하이픈만 허용, 1-50자
 */
export function validateAgentId(agentId) {
  return /^[a-zA-Z0-9-]{1,50}$/.test(agentId);
}

/**
 * API Key 유효성 검사
 */
export function validateApiKey(apiKey) {
  const keyData = apiKeys.get(apiKey);
  return keyData && keyData.agentId && apiKey.length > 10;
}

/**
 * API Key 정보 조회
 */
export function getApiKeyInfo(apiKey) {
  return apiKeys.get(apiKey);
}

/**
 * API Key 저장
 */
export function storeApiKey(apiKey, agentId, ip) {
  apiKeys.set(apiKey, {
    agentId,
    createdAt: new Date().toISOString(),
    ip
  });
}

/**
 * Rate Limiting 체크
 * @param {string} identifier - IP 주소 또는 고유 식별자
 * @param {number} maxRequests - 최대 요청 수 (기본: 1)
 * @param {number} windowMs - 시간 윈도우 (기본: 30분)
 * @returns {boolean} 허용 여부
 */
export function checkRateLimit(identifier, maxRequests = 1, windowMs = 30 * 60 * 1000) {
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

  return record.count < maxRequests;
}

/**
 * Rate Limiting 카운터 증가
 */
export function incrementRateLimit(identifier) {
  const record = rateLimitMap.get(identifier);
  if (record) {
    record.count++;
  }
}

/**
 * Rate Limiting 정보 조회
 */
export function getRateLimitInfo(identifier) {
  return rateLimitMap.get(identifier);
}

/**
 * 저장된 API Key 개수
 */
export function getApiKeyCount() {
  return apiKeys.size;
}

/**
 * 모든 API Key 목록 (디버깅용)
 */
export function getAllApiKeys() {
  return Array.from(apiKeys.entries());
}

// 초기 API Key (백업용 - 환경 변수에서 로드)
export function initializeDefaultKeys() {
  const defaultKeys = process.env.API_KEYS?.split(',').map(k => k.trim()) || [];
  defaultKeys.forEach(key => {
    if (key && !apiKeys.has(key)) {
      apiKeys.set(key, {
        agentId: 'default',
        createdAt: new Date().toISOString(),
        ip: 'system'
      });
    }
  });
}

// 초기화 실행
initializeDefaultKeys();

export default {
  generateApiKey,
  generateAgentId,
  validateAgentId,
  validateApiKey,
  getApiKeyInfo,
  storeApiKey,
  checkRateLimit,
  incrementRateLimit,
  getRateLimitInfo,
  getApiKeyCount,
  getAllApiKeys,
  initializeDefaultKeys
};
