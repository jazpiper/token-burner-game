/**
 * API Key Store - Shared storage for API keys
 * Integrated with PostgreSQL
 */
import db from '../services/db.js';

// API Keys storage cache
const apiKeys = new Map();

// Rate limiting storage for API key registration: { identifier: { count, resetAt } }
const rateLimitMap = new Map();

let isInitialized = false;
let initPromise = null;

/**
 * Initialize API Key Store
 */
async function initializeKeyStore() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Ensure table exists
      await db.query(`
        CREATE TABLE IF NOT EXISTS api_keys (
          api_key VARCHAR(100) PRIMARY KEY,
          agent_id VARCHAR(100) NOT NULL,
          ip VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Load existing keys into memory cache
      const res = await db.query('SELECT * FROM api_keys');
      res.rows.forEach(row => {
        apiKeys.set(row.api_key, {
          agentId: row.agent_id,
          createdAt: row.created_at,
          ip: row.ip
        });
      });
      console.log(`Loaded ${res.rows.length} API keys from database.`);

      // Load from ENV as well
      const defaultKeys = process.env.API_KEYS?.split(',').map(k => k.trim()) || [];
      for (const key of defaultKeys) {
        if (key && !apiKeys.has(key)) {
          // Add to cache first to avoid recursion if storeApiKey calls initialize
          apiKeys.set(key, { agentId: 'default', createdAt: new Date().toISOString(), ip: 'system' });
          await db.query(
            'INSERT INTO api_keys (api_key, agent_id, ip) VALUES ($1, $2, $3) ON CONFLICT (api_key) DO NOTHING',
            [key, 'default', 'system']
          );
        }
      }
      isInitialized = true;
    } catch (e) {
      console.error('Failed to initialize API key store:', e.message);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * API Key 생성
 */
export function generateApiKey() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `jzp-${random}-${timestamp}`;
}

/**
 * Agent ID 생성
 */
export function generateAgentId() {
  const random = Math.random().toString(36).substring(2, 10);
  return `agent-${random}`;
}

/**
 * Agent ID 유효성 검사
 */
export function validateAgentId(agentId) {
  return /^[a-zA-Z0-9-]{1,50}$/.test(agentId);
}

/**
 * API Key 유효성 검사
 */
export async function validateApiKey(apiKey) {
  await initializeKeyStore();

  // Check cache
  if (apiKeys.has(apiKey)) return true;

  // Check DB directly (important for serverless instances that just spun up)
  try {
    const res = await db.query('SELECT * FROM api_keys WHERE api_key = $1', [apiKey]);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      apiKeys.set(row.api_key, {
        agentId: row.agent_id,
        createdAt: row.created_at,
        ip: row.ip
      });
      return true;
    }
  } catch (e) {
    console.error('DB key validation failed:', e.message);
  }

  return false;
}

/**
 * API Key 정보 조회
 */
export async function getApiKeyInfo(apiKey) {
  await initializeKeyStore();

  if (!apiKeys.has(apiKey)) {
    // Try refreshing from DB
    await validateApiKey(apiKey);
  }

  return apiKeys.get(apiKey);
}

/**
 * API Key 저장 (DB + Cache)
 */
export async function storeApiKey(apiKey, agentId, ip) {
  await initializeKeyStore();

  apiKeys.set(apiKey, {
    agentId,
    createdAt: new Date().toISOString(),
    ip
  });

  try {
    await db.query(
      'INSERT INTO api_keys (api_key, agent_id, ip) VALUES ($1, $2, $3) ON CONFLICT (api_key) DO NOTHING',
      [apiKey, agentId, ip]
    );
  } catch (e) {
    console.error('Failed to save API key to DB:', e.message);
  }
}

/**
 * Rate Limiting 체크
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

// 초기화 실행
initializeKeyStore().catch(e => console.error('Early keystore init failed:', e));

export default {
  generateApiKey,
  generateAgentId,
  validateAgentId,
  validateApiKey,
  getApiKeyInfo,
  storeApiKey,
  checkRateLimit,
  incrementRateLimit,
  initializeKeyStore
};
