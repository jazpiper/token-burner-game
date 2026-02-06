/**
 * API Key Store - Shared storage for API keys
 * Integrated with PostgreSQL
 */
import crypto from 'crypto';
import db from '../services/db.js';

export function generateApiKey() {
  return `jzp-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}-${Date.now().toString(36)}`;
}

export function generateAgentId() {
  return `agent-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

export function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function validateAgentId(agentId) {
  return /^[a-zA-Z0-9-]{1,50}$/.test(agentId);
}

export async function validateApiKey(apiKey) {
  try {
    const res = await db.query('SELECT * FROM api_keys WHERE api_key = $1', [apiKey]);
    return res.rows.length > 0;
  } catch (e) {
    console.error('DB key validation failed:', e.message);
    return false;
  }
}

export async function getApiKeyInfo(apiKey) {
  try {
    const res = await db.query('SELECT * FROM api_keys WHERE api_key = $1', [apiKey]);

    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      agentId: row.agent_id,
      createdAt: row.created_at,
      ip: row.ip
    };
  } catch (e) {
    console.error('Failed to fetch API key info:', e.message);
    return null;
  }
}

export async function storeApiKey(apiKey, agentId, ip) {
  try {
    await db.query(
      'INSERT INTO api_keys (api_key, agent_id, ip) VALUES ($1, $2, $3) ON CONFLICT (api_key) DO NOTHING',
      [apiKey, agentId, ip]
    );
    console.log(`Successfully saved API key ${apiKey} to database.`);
  } catch (e) {
    console.error('Failed to save API key to DB:', e.message);
    throw new Error(`Database insertion failed: ${e.message}`);
  }
}

export async function initializeKeyStore() {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS api_keys (
          api_key VARCHAR(100) PRIMARY KEY,
          agent_id VARCHAR(100) NOT NULL,
          ip VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const defaultKeys = process.env.API_KEYS?.split(',').map(k => k.trim()) || [];
      for (const key of defaultKeys) {
        if (key) {
          await db.query(
            'INSERT INTO api_keys (api_key, agent_id, ip) VALUES ($1, $2, $3) ON CONFLICT (api_key) DO NOTHING',
            [key, 'default', 'system']
          );
        }
      }
      console.log('API key store initialized successfully.');
      return;
    } catch (e) {
      console.error(`Failed to initialize API key store (attempt ${attempt}/${maxRetries}):`, e.message);
      if (attempt === maxRetries) {
        throw new Error(`Failed to initialize API key store after ${maxRetries} attempts: ${e.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export default {
  generateApiKey,
  generateAgentId,
  validateAgentId,
  validateApiKey,
  getApiKeyInfo,
  storeApiKey,
  initializeKeyStore
};
