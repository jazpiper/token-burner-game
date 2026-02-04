/**
 * 인증 미들웨어
 * JWT 토큰 및 API Key 검증
 */
import jwt from 'jsonwebtoken';

// 환경 변수 또는 기본 설정
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const API_KEYS = new Set(
  (process.env.API_KEYS || 'demo-key-123,agent-key-456').split(',').map(k => k.trim())
);

/**
 * API Key 검증
 */
export function validateApiKey(apiKey) {
  return API_KEYS.has(apiKey) && apiKey.length > 10;
}

/**
 * JWT 토큰 생성
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * JWT 토큰 검증 미들웨어
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
}

/**
 * API Key 인증 미들웨어
 */
export function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  if (!validateApiKey(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  req.apiKey = apiKey;
  next();
}

/**
 * 이중 인증 미들웨어 (토큰 또는 API Key)
 */
export function authenticateAny(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const apiKey = req.headers['x-api-key'];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  } else if (apiKey) {
    if (!validateApiKey(apiKey)) {
      return res.status(403).json({ error: 'Invalid API key' });
    }
    req.apiKey = apiKey;
    next();
  } else {
    return res.status(401).json({ error: 'Authentication required (token or API key)' });
  }
}

export default { validateApiKey, generateToken, authenticateToken, authenticateApiKey, authenticateAny };
