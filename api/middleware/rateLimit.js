// Rate Limiting Middleware
// Simple in-memory rate limiter

const requestCounts = new Map();
const windowMs = 60 * 1000; // 1 minute window

function getClientIdentifier(req) {
  // Use agent ID if authenticated, otherwise IP
  if (req.agentId) {
    return `agent:${req.agentId}`;
  }

  // Try to get IP from various headers
  const ip = req.headers['x-forwarded-for'] ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             req.ip ||
             'unknown';

  return `ip:${ip}`;
}

function rateLimit(options = {}) {
  const maxRequests = options.maxRequests || 60;
  const customWindowMs = options.windowMs || windowMs;

  return (req, res, next) => {
    const clientId = getClientIdentifier(req);
    const now = Date.now();

    if (!requestCounts.has(clientId)) {
      requestCounts.set(clientId, {
        count: 0,
        resetTime: now + customWindowMs
      });
    }

    const clientData = requestCounts.get(clientId);

    // Reset if window expired
    if (now > clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = now + customWindowMs;
    }

    // Check limit
    if (clientData.count >= maxRequests) {
      const resetAfter = Math.ceil((clientData.resetTime - now) / 1000);

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${resetAfter} seconds.`,
        retryAfter: resetAfter
      });
    }

    // Increment count
    clientData.count++;
    requestCounts.set(clientId, clientData);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - clientData.count);
    res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());

    next();
  };
}

// Clean up old entries periodically
function cleanupOldEntries() {
  const now = Date.now();

  for (const [clientId, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(clientId);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupOldEntries, 5 * 60 * 1000);

export { rateLimit, getClientIdentifier };
