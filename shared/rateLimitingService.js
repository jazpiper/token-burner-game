import db from '../services/db.js';

const DEFAULT_WINDOW_MS = 60 * 1000;
const MAX_RETRY_ATTEMPTS = 3;

async function checkRateLimit(identifier, maxRequests = 100, windowMs = DEFAULT_WINDOW_MS) {
  const now = Date.now();
  const resetAt = new Date(now + windowMs);

  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const res = await db.query(
        `SELECT count, reset_at FROM rate_limits WHERE identifier = $1`,
        [identifier]
      );

      if (res.rows.length === 0) {
        await db.query(
          'INSERT INTO rate_limits (identifier, count, reset_at) VALUES ($1, 1, $2)',
          [identifier, resetAt]
        );
        return { allowed: true, remaining: maxRequests - 1, resetAt };
      }

      const row = res.rows[0];
      const dbResetTime = new Date(row.reset_at).getTime();

      if (now > dbResetTime) {
        await db.query(
          'UPDATE rate_limits SET count = 1, reset_at = $1 WHERE identifier = $2',
          [resetAt, identifier]
        );
        return { allowed: true, remaining: maxRequests - 1, resetAt };
      }

      if (row.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: dbResetTime };
      }

      await db.query(
        'UPDATE rate_limits SET count = count + 1 WHERE identifier = $1',
        [identifier]
      );
      return { allowed: true, remaining: maxRequests - row.count - 1, resetAt: dbResetTime };
  } catch (e) {
    if (attempt === MAX_RETRY_ATTEMPTS - 1) {
      console.error('Rate limit check failed after retries:', e.message);
      return { allowed: false, remaining: 0, resetAt: now + windowMs };
    }
    await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
  }
}
}

async function incrementRateLimit(identifier) {
  try {
    await db.query(
      'UPDATE rate_limits SET count = count + 1 WHERE identifier = $1',
      [identifier]
    );
  } catch (e) {
    console.error('Failed to increment rate limit:', e.message);
  }
}

async function resetRateLimit(identifier) {
  try {
    await db.query(
      'UPDATE rate_limits SET count = 0, reset_at = CURRENT_TIMESTAMP WHERE identifier = $1',
      [identifier]
    );
  } catch (e) {
    console.error('Failed to reset rate limit:', e.message);
  }
}

async function cleanupOldRateLimits() {
  try {
    const res = await db.query(
      'DELETE FROM rate_limits WHERE reset_at < CURRENT_TIMESTAMP - INTERVAL \'24 hours\''
    );
    console.log(`Cleaned up ${res.rowCount} old rate limit records.`);
  } catch (e) {
    console.error('Failed to cleanup rate limits:', e.message);
  }
}

export {
  checkRateLimit,
  incrementRateLimit,
  resetRateLimit,
  cleanupOldRateLimits
};
