// Authentication Middleware
// Validates JWT tokens and API keys

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'token-burner-secret-key';

// Store API keys in memory (in production, use a database)
const apiKeys = new Map();

// Generate API key
function generateApiKey() {
  return `tbk_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

// Register API key
function registerApiKey(agentId = null) {
  const apiKey = generateApiKey();
  const data = {
    apiKey,
    agentId: agentId || `agent_${Date.now()}`,
    createdAt: Date.now()
  };
  apiKeys.set(apiKey, data);
  return data;
}

// Validate API key
function validateApiKey(apiKey) {
  const data = apiKeys.get(apiKey);
  return data ? data : null;
}

// Generate JWT token
function generateToken(agentId, apiKey) {
  return jwt.sign(
    { agentId, apiKey },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Express middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token required'
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token'
    });
  }

  req.agentId = decoded.agentId;
  req.apiKey = decoded.apiKey;
  next();
}

// Express middleware to verify API key (alternative to JWT)
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required'
    });
  }

  const data = validateApiKey(apiKey);

  if (!data) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }

  req.agentId = data.agentId;
  next();
}

// Allow either JWT or API key
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const apiKey = req.headers['x-api-key'];

  // Try JWT first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (decoded) {
      req.agentId = decoded.agentId;
      req.apiKey = decoded.apiKey;
      return next();
    }
  }

  // Try API key
  if (apiKey) {
    const data = validateApiKey(apiKey);

    if (data) {
      req.agentId = data.agentId;
      return next();
    }
  }

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Valid authentication required (Bearer token or X-API-Key header)'
  });
}

export {
  generateApiKey,
  registerApiKey,
  validateApiKey,
  generateToken,
  verifyToken,
  authenticateToken,
  authenticateApiKey,
  authenticate
};
