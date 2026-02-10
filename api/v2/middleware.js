/**
 * API Middleware
 * Shared middleware functions for API endpoints
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Set CORS headers for response
 * @param {Object} res - Response object
 * @param {string[]} methods - Allowed HTTP methods
 */
export function setCORSHeaders(res, methods = ['GET', 'POST', 'OPTIONS']) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', methods.join(', ''));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
}

/**
 * Handle OPTIONS pre-flight request
 * @param {Object} res - Response object
 * @returns {boolean} - true if OPTIONS request was handled
 */
export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Verify JWT token from Authorization header
 * @param {Object} req - Request object
 * @returns {Object|null} - Decoded token or null if invalid
 */
export function verifyAuth(req) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Require authentication middleware wrapper
 * @param {Function} handler - Request handler function
 * @returns {Function} - Wrapped handler with auth check
 */
export function requireAuth(handler) {
  return async (req, res) => {
    const decoded = verifyAuth(req);

    if (!decoded) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid authentication required'
      });
    }

    // Attach decoded user to request
    req.user = decoded;

    return handler(req, res);
  };
}

/**
 * Parse query parameters from URL
 * @param {Object} req - Request object
 * @param {Object} defaults - Default values for params
 * @returns {Object} - Parsed query parameters
 */
export function parseQueryParams(req, defaults = {}) {
  const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;

  return {
    page: parseInt(urlParams.get('page')) || defaults.page || 1,
    limit: parseInt(urlParams.get('limit')) || defaults.limit || 20,
    difficulty: urlParams.get('difficulty'),
    type: urlParams.get('type'),
    agentId: urlParams.get('agentId'),
    ...defaults
  };
}

/**
 * Build filters object from query params
 * @param {Object} params - Query parameters
 * @param {string[]} allowedKeys - Keys to include in filters
 * @returns {Object} - Filters object
 */
export function buildFilters(params, allowedKeys = ['difficulty', 'type', 'agentId']) {
  return Object.fromEntries(
    allowedKeys
      .map(key => [key, params[key]])
      .filter(([_, value]) => value !== undefined && value !== null)
  );
}

/**
 * Standard error response helpers
 */
export const responses = {
  badRequest: (message, details = []) => ({
    status: 400,
    body: {
      error: 'Bad Request',
      message,
      ...(details.length > 0 && { details })
    }
  }),

  unauthorized: (message = 'Authentication required') => ({
    status: 401,
    body: {
      error: 'Unauthorized',
      message
    }
  }),

  forbidden: (message = 'Access denied') => ({
    status: 403,
    body: {
      error: 'Forbidden',
      message
    }
  }),

  notFound: (resource = 'Resource') => ({
    status: 404,
    body: {
      error: 'Not Found',
      message: `${resource} not found`
    }
  }),

  conflict: (message) => ({
    status: 409,
    body: {
      error: 'Conflict',
      message
    }
  }),

  tooManyRequests: (message = 'Too many requests, please try again later') => ({
    status: 429,
    body: {
      error: 'Too Many Requests',
      message
    }
  }),

  internalError: (message = 'Internal Server Error') => ({
    status: 500,
    body: {
      error: 'Internal Server Error',
      message
    }
  }),

  success: (data, message = 'Success') => ({
    status: 200,
    body: {
      success: true,
      message,
      ...data
    }
  })
};

/**
 * Send standardized response
 * @param {Object} res - Response object
 * @param {Object} responseObj - Response object from responses helpers
 */
export function sendResponse(res, responseObj) {
  res.status(responseObj.status).json(responseObj.body);
}
